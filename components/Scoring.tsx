import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { v4 } from 'uuid';
import { mean, min, max } from 'lodash';
import useLocalStorage from './useLocalStorage';
import { useNode, AspotWrapper, useAspotContext} from '@aspot/react';
import { aspot, has, localConnector, PredicateNode, StoreNode, TermType  } from '@aspot/core';
import webSocketConnector from '@aspot/websocket';

const UserDiv = (props:{name:string, updateName:(s:string) => void}) => {
	const {name, updateName, ...rest } = props;
	return (
	  <input 
      className = "text-center border w-full p-2 text-lg" 
      placeholder="Your name" 
      onBlur={e => updateName(e.target.value)}
      defaultValue = {name}
      {...rest}
    ></input>
	)
}
const ScoreDiv = (props:{score:number, updateScore:((n:number) => void)}) => {
	const {score, updateScore} = props;
	(props);
	return (
	  <Slider 
	    className ="my-12 mt-4 mb-8"
	    min={1} 
	    max={10} 
	    step={1} 
	    marks={{1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10}} 
	    dots
	    onChange={updateScore}
	  /> 
	)
}
const ReasonDiv = (props:{reason:string, updateReason:(r:string) => void}) => {
	const {reason, updateReason, ...rest } = props;
	return (
	  <textarea className = "max-w-full border w-full p-2 text-lg " placeholder ="Reason for Score" onBlur={e => updateReason(e.target.value)} {...rest}>{reason}</textarea>
  )
}
const ResultRow = (props:{data:PredicateNode<StoreNode>, removeItem:() => void}) => {
	const {data, removeItem } = props;
  const name = useNode(data.s('name')) as string;
  const score = useNode(data.s('score')) as string;
  const reason = useNode(data.s('reason')) as string;
	return (
	  <tr className="border-t">
	    <td className="p-2 text-center">{name}</td>
	    <td className="text-center">{score}</td>
	    <td className="text-center w-7/12">{reason}</td>
	    <td className="text-center w-1/12" >
	      <div className ="cursor-pointer p-2 rounded-full border-red-700 text-red-700 hover:font-bold" onClick={removeItem} >X</div>
	    </td>
	  </tr>
	)
}
const Results = (props:{data:PredicateNode<StoreNode>[], deleteItem:(i:string) => void}) => {
	const { data, deleteItem } = props;
	//const stuff = useContextGun()(data, 'data');
	return (
	  <table className="table-fixed">
	    <thead>
	      <tr>
          <th className="w-1/6">Name</th>
          <th className="w-1/6">Score</th>
          <th className="w-7/12">Reason</th>
          <th className="w-1/12"></th>
	      </tr>
	    </thead>
	    <tbody>
	    {data.map((node) => {
        const id=node.predicate()
	      return (<ResultRow key={id} removeItem={() => deleteItem(id)} data={node} />)
	    })}
	    </tbody>
	  </table>
	)
}
type DataItem = {
  name: string,
  score: string,
  reason: string,
}
type Data = {
  [key:string] : DataItem,
}
const Summary = (props:{ data:PredicateNode<StoreNode>[]}) => {
  const {data} = props;
  const db = useAspotContext();
  const scoreNodes = db.find(has(TermType.predicate)('score')).list();
  const scores = scoreNodes.map(n => n.is() || '')
  return (
    <table className="w-1/4 text-lg mx-auto my-4">
      <caption className="font-bold text-2xl">Summary Data</caption>
      <tbody>
        <tr>
          <th className="text-left p-2">Max</th>
          <td  className="text-center">{max(scores)}</td>
        </tr>
        <tr className ="border-t">
          <th className="text-left p-2">Mean</th>
	        <td  className="text-center">{mean(scores)}</td>
        </tr>
        <tr className ="border-t">
          <th className="text-left p-2">Min</th>
          <td className="text-center">{min(scores)}</td>
        </tr>
      </tbody>
    </table>
  )
}
const MeetingAppInner = (props:{userId:string}) => {
  const {userId} = props;
  const db = useAspotContext();
  const scoresNode = db.node('scores')
  const currentScoreNode = scoresNode.s(userId);
  const scores = useNode(scoresNode) as PredicateNode<StoreNode>[];
  const currentScore = useNode(currentScoreNode.s('score')) as string;
  const currentReason = useNode(currentScoreNode.s('reason')) as string;
  const currentName = useNode(currentScoreNode.s('name')) as string;

	const updateScore = (score:string) => {
    currentScoreNode.s('score').is(score);
	}
	const updateReason = (reason:string) => {
	  currentScoreNode.s('reason').is(reason);
	}
	const updateName = (name:string) => {
	  currentScoreNode.s('name').is(name);
	}
	const deleteItem = (key:string) => {
    scoresNode.s(key).del(1);
	}
	const [hideResults, setHideResults] = useState(true)
	const unhide = () => {
		console.log('unhide');
		setHideResults(false)
	}
	return (
		<>
	    <UserDiv  name={currentName} updateName={currentScoreNode.s('name').is} />
	    <ScoreDiv score={parseInt(currentScore)} updateScore={(v) => currentScoreNode.s('name').is(v.toString())} />
	    <ReasonDiv reason={currentReason} updateReason={currentScoreNode.s('reason').is} />
      <button className='w-full border rounded hover:bg-gray-100 focus:bg-gray-100' onClick={unhide}>See Results</button>
	    { !hideResults ? <><Results data={scores} deleteItem={deleteItem} /> <Summary data={scores} /></> : <></> }
     
    </>
	)
}
const MeetingApp = (props:{id:string}) => {
	const {id:meetingId} = props;
	const [userId, setUserId ] = useLocalStorage('meetingUserId2', v4());
  const node = aspot();
	webSocketConnector('ws://localhost:8080', meetingId)(node);
	return (
		<AspotWrapper node={node} >
      <MeetingAppInner userId={userId} />
	  </AspotWrapper>
	)
}
export default MeetingApp;