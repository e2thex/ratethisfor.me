import { v4 } from "uuid";
import { objectIs } from ".";
import { and, predicateIs, subjectIs } from "./find";
import { Match, NodeProps, OnFunc, OnIs, PredicateNode, Sentence, SubjectNode } from "./type";

const watcher = (match:Match) => (action:() => void) => (sentence:Sentence) => {
  if(match(sentence)) action();
}
const predicateNode = (props:NodeProps) => (subject:string) => (predicate:string, onIs?:OnIs) =>{
	const {update, find, addWatcher, node } = props
  const onUpdates = [] as OnFunc[];
  const match = and(subjectIs(subject), predicateIs(predicate)) 
  const updateV = () => {
	  const sentence = find(match).sentence();
    const v = sentence ? sentence.object : null;
    onUpdates.forEach(up => up(v))
    return v;
  }
	const val = () => {
    const v = updateV();
    addWatcher(watcher(match)(updateV))
	  return v;
	}
  const nonEmptyVal = () => val() || subject + predicate; 
	const is = (object:string) => {
	  if(onIs) onIs();
	  const sentence = {subject, predicate, object, date:Date.now()} 
	  update(sentence);
    updateV();
	}

	const s = (newPredicateIn?:string):PredicateNode => {
	  const newPredicate = newPredicateIn || v4().toString();
	  const currentObject = val();
	  const object = nonEmptyVal();
	  const newOnIs = () => {
	    if(!currentObject) is(object);
	  }
	  return predicateNode(props)(object)(newPredicate, newOnIs);
	}
  const findNext = (match:Match) => find(and(subjectIs(nonEmptyVal()), match));
	const all = () => {
	  const object = nonEmptyVal();
    return node(object);
	};
	const del = (depth=0) => {
    if (depth>0) all().del(depth)
	  update({subject, predicate, object:null, date:Date.now()})
	}
  const on = (f:OnFunc) => {
    onUpdates.push(f);
  }
  const PredicateNode = {
	  is,s,val,all,del, on, predicate: () => predicate, find:findNext,
	} as PredicateNode;
  return PredicateNode;
}
const subjectNode = (props:NodeProps) => (subjectIn?: string, onIs?:OnIs) => {
	const {update, find, addWatcher } = props
	const subject = subjectIn || v4().toString();
  const match = subjectIs(subject);
	const s = (predicate:string) => predicateNode(props)(subject)(predicate);
	const val = () => {
	  return find(subjectIs(subject)).objectAsNode();
  }
  const on = (f:OnFunc) => {
    addWatcher(watcher(match)(() => {
        f(val())
      })
    );
  };
  const del = (depth=0) => val().forEach(n => n.del(depth-1))
  const findNext = (match:Match) => find(and(subjectIs(subject), match));
  const SubjectNode = {
	  val,s, on, del, find:findNext,
	} as SubjectNode;
  return SubjectNode;
};
export {
  predicateNode,
  subjectNode,
}
      