import { findIndex, takeRight } from "lodash";
import { findSentences, matchPartial } from "./find";
import { predicateNode, subjectNode } from "./node";
import { Database, Match, MatchContext, NodeProps, Sentence, Watcher } from "./type";

const updateSentence = (database:Database)=> (watchers:Watcher[]) => (update:Sentence) =>{
	if(database.date >= update.date) return;
	const {subject, predicate} = update;
	const currentIndex = findIndex(database.sentences, matchPartial({subject, predicate}).simple);
	if((currentIndex >= 0) && database.sentences[currentIndex].date >= update.date)  return;
	if(currentIndex >= 0 ) database.sentences.splice(currentIndex, 1);
  database.sentences.push(update as Sentence)
  watchers.forEach(watcher => {
    watcher(update)
  });
  
}
  const emptyDatabase = ():Database => ({
    sentences: [],
    date: 0,
  })
  const db = (database:Database) => {
	const watchers = []as Watcher[];
	const that = {} as NodeProps;
	that.node = (subject?:string) => subjectNode(that)(subject);
	that.update = (update:Sentence) => {
		updateSentence(database)(watchers)(update);
	}
  that.reset = (newDb:Database) => { 
    database.date = newDb.date;
    database.sentences = newDb.sentences;
  };
	that.find = findSentences(that)(database.sentences)
  that.addWatcher = (watcher:Watcher) => {
    watchers.push(watcher)
  }
	return that;
}
const localDb = (name: string) => {
  const retriveDB = () => {
    if(typeof window !== 'undefined') {
      if (window.localStorage.getItem(name)) {
        return JSON.parse(window.localStorage.getItem(name)) as Database;
      }
    }
    return emptyDatabase();
  }
  const database = retriveDB();
  const writeDB = () => {
    if(typeof window !== 'undefined') {
      window.localStorage.setItem(name, JSON.stringify(database));
    }
  }
  const that = db(database);
  that.addWatcher(writeDB);
  return that;
}
const webSocketDB = (url:string, group:string) => {
  const internalDb = db(emptyDatabase())
  if(typeof window !== 'undefined') {
    const onUpdate = (sentence:Sentence) => {
      internalDb.update(sentence);
    }
    const ws = new WebSocket('ws://localhost:8080');
    ws.addEventListener('open', function (event) {
      if(group) {
        ws.send(JSON.stringify({action:'join', group}));
        ws.send(JSON.stringify({action:'requestUpdates', group}));
      }
      ws.addEventListener('message', (event) => {
        const {action, ...data } = JSON.parse(event.data);
        if(action === 'update') {
          data.sentences.forEach(onUpdate);
        }
        if(action === 'requestUpdates') {
          sendAllUpdate();
        }
      })
    });
    const sendUpdate = (sentence:Sentence) => {
      const pack = {action:'update', group, sentences: [sentence]}
      ws.send(JSON.stringify(pack))
    }
    const sendAllUpdate = () => {
      const pack = {action:'update', group, sentences: internalDb.find(() => true).sentences()}
      ws.send(JSON.stringify(pack))
    }
    internalDb.addWatcher(sendUpdate)

  }
  return internalDb;
}
export default db;
export {
  localDb,
  webSocketDB,
  emptyDatabase,
}
