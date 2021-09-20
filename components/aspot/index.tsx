import db from "./db";
import {
  matchPartial,
  subjectIs,
  predicateIs,
  objectIs,
  and,
  or,
  not,
} from "./find";



const test  = () => {
  const data = {sentences: [], date: Date.now()};
  const aspot = db(data);
  const bob = aspot.node()
  bob.s('name').s('first').is('Bob');
  bob.s('name').s('last').is('Jones');
  bob.s('best friend').s('name').s('first').is('Sally');
  const sallyname = aspot.find(matchPartial({predicate:'first', object:'Sally'})).subjectAsNodeOnce();
  if (sallyname) sallyname.s('last').is('Walker');
  aspot.find(matchPartial({predicate:'first', object:'Bob'})).subjectAsNode().forEach(n => console.log({last:n.s('last').val()}));
  console.log(bob.s('best friend').s('name').s('last').val())
  bob.s('friend').s().is('joe')
  bob.s('friend').s().is('tim')
  bob.s('friend').s().is('cathey')
  bob.s('friend').all()[1].del();
  console.log(bob.s('friend').all())
  console.log(bob.s('friend').all().map(a => a.val()))
  console.log(data);
}

export default test;
export {
  db as aspot,
  subjectIs,
  predicateIs,
  objectIs,
  and,
  or,
  not,
  matchPartial
}