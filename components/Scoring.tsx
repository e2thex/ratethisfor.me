import Gun from 'gun';
import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { v4 } from 'uuid';
import { mean, min, max } from 'lodash';
import useLocalStorage from './useLocalStorage';
import { useNode, AspotWrapper, useAspotContext} from '@aspot/react';
import { aspot, has, localConnector, TermType  } from '@aspot/core';
import webSocketConnector from '@aspot/websocket';

const UserDiv = (props) => {
	const {name, updateName, ...rest } = props;
	const updateChange = (e:Event) => updateName(e.currentTarget.value)
	return (
	  <input 
      className = "text-center border w-full p-2 text-lg" 
      placeholder="Your name" 
      onBlur={updateChange}
      defaultValue = {name}
      {...rest}
    ></input>
	)
}
const ScoreDiv = (props) => {
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
const ReasonDiv = (props) => {
	const {reason, updateReason, ...rest } = props;
	const updateChange = (e:Event) => {
    const val = e.currentTarget.value;
	    updateReason(val);
	}
	return (
	  <textarea className = "max-w-full border w-full p-2 text-lg " placeholder ="Reason for Score" onBlur={updateChange} {...rest}>{reason}</textarea>
  )
}
const ResultRow = (props) => {
	const {data, removeItem } = props;
  const name = useNode(data.s('name'));
  const score = useNode(data.s('score'));
  const reason = useNode(data.s('reason'));
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
const Results = (props) => {
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
const Summary = (props) => {
  const {data} = props;
  const db = useAspotContext();
  const scoreNodes = db.find(has(TermType.predicate)('score')).list();
  const scores = scoreNodes.map(n => n.is())
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
const MeetingAppInner = (props) => {
  const {userId} = props;
  const db = useAspotContext();
  const scoresNode = db.node('scores')
  const currentScoreNode = scoresNode.s(userId);
  const scores = useNode(scoresNode)
  const currentScore = useNode(currentScoreNode.s('score'))
  const currentReason = useNode(currentScoreNode.s('reason'))
  const currentName = useNode(currentScoreNode.s('name')) 

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
	const unhide = (event) => {
		console.log('unhide');
		setHideResults(false)
	}
	return (
		<>
	    <UserDiv  name={currentName} updateName={updateName} />
	    <ScoreDiv score={currentScore} updateScore={updateScore} />
	    <ReasonDiv reason={currentReason} updateReason={updateReason} />
      <button className='w-full border rounded hover:bg-gray-100 focus:bg-gray-100' onClick={unhide}>See Results</button>
	    { !hideResults ? <><Results data={scores} deleteItem={deleteItem} /> <Summary /></> : <></> }
     
    </>
	)
}
const MeetingApp = (props) => {
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