import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Gun from 'gun';
import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { v4 } from 'uuid';
import { useGunState } from '@altrx/gundb-react-hooks';
import { isEqual, omit } from 'lodash';
import { loadGetInitialProps } from 'next/dist/shared/lib/utils';
import { useHistory, useLocation } from 'react-router-dom';


const useLocalStorage = (key:string, defaultValue:string) => {
  const [value, setInternalValue ] = useState(defaultValue);
  if(typeof window !== 'undefined') {
    if (window.localStorage.getItem(key)) {
      if (value !== window.localStorage.getItem(key) ) {
        setInternalValue(window.localStorage.getItem(key))
      }
    }
    else {
      window.localStorage.setItem(key, value);
    }
  }
  const setValue = (v:string) => {
    if(typeof window !== 'undefined') {
      window.localStorage.setItem(key, v)
      // setInternalValue(window.localStorage.getItem(key))
    }
  }
  return [value, setValue];

}
const UserDiv = (props) => {
  const {name, updateName, ...rest } = props;
  const updateChange = (e:Event) => updateName(e.currentTarget.value)
  return (
    <input className = "text-center border w-full p-2 text-lg" placeholder="Your name" value = {name} onChange={updateChange}></input>
  )
}
const ScoreDiv = (props) => {
  const {score, updateScore} = props;
  console.log(props);
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
    console.log(e.currentTarget.value)
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
  console.log(props);
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
        console.log(id);
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
  }
  type Data = {
    [key:string] : DataItem,
  }
const MeetingApp = (props) => {
  const {id} = props;
  const [userId, setUserId ] = useLocalStorage('meetingUserId', v4());
  //const globalGun = Gun(['https://e2thex-meeting-score.herokuapp.com/gun']);
   const globalGun = Gun();
 // const globalGun = Gun(['http://localhost:8765/gun']);
  const [data, setData] = useState({} as Data);
  globalGun.get(id).map().on((d, key) => {
    const newData = omit(data, key); 
    const candidate = d === null
      ? {...newData }
      : {...newData, [key]: {name: d.name, score: d.score, reason:d.reason}};
    if (!isEqual(candidate[key], data[key]))  {
      console.log(JSON.stringify({candidate, data}))
      setData(candidate);
    } else {
      console.log('same so skip!')
    }
  });
  const updateScore = (score:string) => {
    globalGun.get(id).get(userId).put({score});
    console.log({data, newdata: {...data, [userId]: {...data[userId], score}}});
    // setData({...data, [userId]: {...data[userId], score}})
  }
  const updateReason = (reason:string) => {
    globalGun.get(id).get(userId).put({reason});
    console.log({data, newdata: {...data, [userId]: {...data[userId], reason}}});
    // setData({...data, [userId]: {...data[userId], score}})
  }
  const updateName = (name:string) => {
    globalGun.get(id).get(userId).put({name});
    console.log({data, newdata: {...data, [userId]: {...data[userId], name}}});
    // setData({...data, [userId]: {...data[userId], name}})
  }
  const deleteItem = (key:string) => {
    globalGun.get(id).get(key).put(null);
  }
  const userName = data[userId] ? data[userId].name : '';
  const userScore = data[userId] ? data[userId].score : '';
  return (
    <>
      <UserDiv  name={userName} updateName={updateName} />
      <ScoreDiv score={userScore} updateScore={updateScore} />
      <ReasonDiv updateReason={updateReason} />
      <Results data={data} deleteItem={deleteItem} />
    </>
  )
}
const MeetingSelector = () => {
  const [newId, setNewId ] = useState('');
  // const history = useHistory();
  return (
    <>
      Enter Meeting id
      <input value = {newId} onChange = {(e) => setNewId(e.currentTarget.value)} />
      <button value = "go" onClick={() => window.location.replace(`?id=${encodeURI(newId)}`)}>Go</button>  
    </>
  )
}
const Home: nextpage = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log({id});
  const MeetingBody = id ? MeetingApp : MeetingSelector
    return (
    <div className="container max-w-2xl mx-auto">
      <Head>
        <title>Rate Your Meeting!</title>
        <meta name="description" content="generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
        <h1 className={styles.title}>
          Rate your Meeting
        </h1>
          <MeetingBody id={id}/>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="vercel logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
