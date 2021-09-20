import Gun from 'gun';
import React, { useContext, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { v4 } from 'uuid';
import { isEqual, omit, mean, min, max } from 'lodash';
import useLocalStorage from './useLocalStorage';
import { DataContext, GunWrapper, IdContext, NodeContext } from './Gun';

const UserDiv = (props) => {
	const {name, updateName, ...rest } = props;
	const updateChange = (e:Event) => updateName(e.currentTarget.value)
	return (
	  <input 
      className = "text-center border w-full p-2 text-lg" 
      placeholder="Your name" 
      onChange={updateChange}
      defaultValue = {name}
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
	  updateReason(e.currentTarget.value);
	}
	return (
	  <textarea className = "max-w-full border w-full p-2 text-lg " placeholder ="Reason for Score" value = {reason} onChange={updateChange} {...rest}></textarea>
      )
      }
      const ResultRow = (props) => {
	const {data, removeItem } = props;
	const {name, score, reason } = data ? data : {name:'', score:'', reason: ''}
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
	    {Object
	      .keys(data)
	      .sort()
	      .map(id => {
	      return (<ResultRow key={id} removeItem={() => deleteItem(id)} data={data[id]} />)
	    })}
	    </tbody>
	  </table>
	)
       return <div></div>
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
  const scores = Object.keys(data).map(i => data[i].score);
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
  const {userName, setUserName} = props
  const data = useContext(DataContext);
  const {currentMeetingNode, currentUserNode} = useContext(NodeContext);
  const {meetingId, userId} = useContext(IdContext);

	const updateScore = (score:string) => {
	  currentUserNode.put({score});
	}
	const updateReason = (reason:string) => {
	  currentUserNode.put({reason});
	}
	const updateName = (name:string) => {
	  currentUserNode.put({name});
    setUserName(name);
	}
	const deleteItem = (key:string) => {
    currentMeetingNode.get(key).put(null);
	}
	const userScore = data[userId] ? data[userId].score : '';
	return (
		<>
	    <UserDiv  name={userName} updateName={updateName} />
	    <ScoreDiv score={userScore} updateScore={updateScore} />
	    <ReasonDiv updateReason={updateReason} />
	    <Results data={data} deleteItem={deleteItem} />
      <Summary data={data} />
    </>
	)
}
const MeetingApp = (props) => {
	const {id:meetingId} = props;
	const [userId, setUserId ] = useLocalStorage('meetingUserId', v4().toString());
	const [userName, setUserName ] = useLocalStorage('meetingUserName', '');
	return (
	  <GunWrapper meetingId={meetingId} userId={userId} >
      <MeetingAppInner userName={userName} setUserName={setUserName} />
	  </GunWrapper>
	)
}
export default MeetingApp;