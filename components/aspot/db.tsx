import { findIndex, takeRight } from "lodash";
import { findSentences, matchPartial } from "./find";
import { predicateNode, subjectNode } from "./node";
import { Database, Match, MatchContext, NodeProps, Sentence, Update, Watcher } from "./type";

const updateSentence = (database:Database) => (update:Sentence) =>{
	if(database.date > update.date) return;
	const {subject, predicate} = update;
	const currentIndex = findIndex(database.sentences, matchPartial({subject, predicate}));
	if((currentIndex >= 0) && database.sentences[currentIndex].date > update.date)  return;
	if(currentIndex >= 0 ) database.sentences.splice(currentIndex, 1);
	if(update.object) database.sentences.push(update as Sentence)
      }
      
  const db = (database:Database) => {
	const watchers = []as Watcher[];
	const that = {} as NodeProps;
	that.node = (subject?:string) => subjectNode(that)(subject);
	that.update = (update:Sentence) => {
		updateSentence(database)(update);
    watchers.forEach(watcher => {
      watcher(update)
    });
	}
	that.find = findSentences(that)(database.sentences, { prevSentences:[] } as MatchContext)
  that.addWatcher = (watcher:Watcher) => {
    watchers.push(watcher)
  }
	return that;
}
export default db;