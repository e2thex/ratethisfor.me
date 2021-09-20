import { flatten } from "lodash";
import next from "next";
import { predicateNode, subjectNode } from "./node";
import {
  Sentence,
  CountOps,
  Match,
  NodeProps,
  SentenceResult,
  Term,
  WhereMatch,
  GroupSentences,
  MatchContext,
  Compare,
  TermType,
  MatchFunc,
  MatchWithMeta
} from "./type";

const regExOrCompare = (test:string|RegExp) => (val:string) => (
  (test instanceof RegExp) 
    ? (val.match(test) ? true : false)
    : val === test
); 
const where = (part:Term) => (
  {
    match: (v:string|RegExp) => is(part)(v),
    matchPrev: (prevPart:Term) => join('prev')(prevPart)(part), 
    matchWith: (search:string) => (prevPart:Term) => join(search)(prevPart)(part), 
  }
)
const is = (part:Term) => (v:string|RegExp) =>  addMatchMeta((sentence:Sentence) => {
  const compare = sentence[part]
  if (!compare) return false;
  return regExOrCompare(v)(compare);
}); 
const subjectIs = (subject:string|RegExp):Match => is(TermType.subject)(subject);
const predicateIs = (predicate:string|RegExp):Match => is(TermType.predicate)(predicate); 
const objectIs = (object:string|RegExp):Match => is(TermType.object)(object);
const and = (...clauses:Match[]) => (sentence:Sentence, context?:MatchContext) => (
  clauses.reduce((result, clause) => result && clause(sentence, context) ,true)
);
const or = (...clauses:Match[]) => (sentence:Sentence, context?:MatchContext) => (
  clauses.reduce((result, clause) => result || clause(sentence, context) ,false)
);
const not = (clause:Match):Match =>  addMatchMeta((sentence, context) => !clause(sentence, context));

const matchPartial = (search:Partial<Sentence>) => addMatchMeta((sentence:Sentence) => {
  const m = (
    (search.subject ? (search.subject === sentence.subject) : true) &&
    (search.predicate ? (search.predicate === sentence.predicate) : true) &&
    (search.object ? (search.object === sentence.object) : true));
  return m;
});
const addMatchMeta = (match:MatchFunc):MatchWithMeta => {
  const matchWMeta = addMatchMeta(match);
  return Object.assign(
    match,
    {
        or: (nextMatch:Match) => or(matchWMeta, nextMatch),
        and: (nextMatch:Match) => and(matchWMeta, nextMatch),
        simple: (sentence:Sentence) => match(sentence),
    }
  )
}
const join = (resultName:string) => (prev:Term) =>(next:Term) => addMatchMeta(
  (sentence, context) => {
    const { sentences } = context || defaultMatchContext();
    return sentences[resultName] ? sentences[resultName].map(s => s[prev]).includes(sentence[next]) : false;
  } 
);
const joinPrev = join('prev');
const sentenceResult = (nodeProps:NodeProps) => (sentences:Sentence[], context?:MatchContext) => {
  const { find } = nodeProps;
  const subjectAsNode = () => sentences.map(s => subjectNode(nodeProps)(s.subject));
  const objectAsNode = () => sentences.map(s => predicateNode(nodeProps)(s.subject)(s.predicate));
  return {
    sentences: () => sentences,
    sentence: () => sentences[0] || null,
    subjectAsNode:  () => subjectAsNode(),
    objectAsNode: () => objectAsNode(),
    subjectAsNodeOnce: () => subjectAsNode()[0] || null,
    objectAsNodeOnce: () => objectAsNode()[0] || null,
    groupBy: (part:Term) => groupResult(nodeProps)(groupSentences(sentences)(part), context),
    next: (match:Match) => find(match, combineContext(context, {sentences:{prev:sentences}})),
    nextAs: (name:string) => (match:Match) => find(match, combineContext(context, {sentences:{[name]:sentences, prev:sentences}}))
  } as SentenceResult;
}
const combineContext = (...contexts:(MatchContext | undefined)[]) => (
  contexts.reduce((result:MatchContext, context) => {
    return context ? {...result, ...context, sentences: { ...result.sentences, ...context.sentences}} : result;
  }, defaultMatchContext())
);
const groupSentences = (sentences:Sentence[]) => (part:Term) =>{
  return sentences.reduce((result, sentence) => {
    const groupValue = sentence[part];
    if(groupValue && result[groupValue]) result[groupValue] = [];
    if(groupValue) result[groupValue].push(sentence);
    return result;
  }, {} as GroupSentences)
}
const whereGroupSentences = (result:GroupSentences) => (match:WhereMatch)=> {
  return Object.keys(result).reduce((r, key) => {
    const s = result[key];
    if (match(s)) {
      r[key] = result[key];
    }
    return r;
  }, {} as GroupSentences)
}
const groupResult = (nodeProps:NodeProps) => (result:GroupSentences, context?:MatchContext) =>{
  const sentences = () => flatten(Object.values(result));
  return {
    sentences,
    degroup: ():SentenceResult => sentenceResult(nodeProps)(sentences(), context),
    asNode: () => Object.keys(result).map(key => subjectNode(nodeProps)(key)),
    having: (match:WhereMatch) => groupResult(nodeProps)(whereGroupSentences(result)(match)),
  }
}

// FilterOnCountMatch
const countIs= (op:Compare, value:number) => (sentences:Sentence[]) => {
  const count = sentences.length;
  return {
    "=": () => count === value,
    ">=": () => count >= value,
    ">": () => count > value,
    "<=": () => count <= value,
    "<": () => count < value,
  }[op]();
}
const defaultMatchContext = () => ({sentences:{}} as MatchContext);
const filteredSentences = (sentences:Sentence[]) => (
  sentences.filter(s => !s.object === null)
)
const findSentences = (nodeProps:NodeProps) => (from:Sentence[]) => (match:Match, context:MatchContext=defaultMatchContext()) => (
  sentenceResult(nodeProps)(filteredSentences(from).filter(s => match(s, context)))
);
export {
  subjectIs,
  predicateIs,
  objectIs,
  and,
  or,
  not,
  matchPartial,
  findSentences,
  join,
  joinPrev,
  is,
  countIs,
  where,
}