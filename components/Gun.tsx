import React, { useState, ComponentType, Context } from "react";
import { omit, isEqual } from "lodash";
import Gun from "gun";
import { IGunChainReference } from "gun/types/chain";
type DataItem = {
  name: string,
  score: string,
  reason: string,
}
type Data = {
  [key:string] : DataItem,
}
type Nodes = {
  [key:string] : IGunChainReference,
}
const DataContext = React.createContext({} as Data)
const NodeContext = React.createContext({} as Nodes)
const IdContext = React.createContext({})
const GunWrapper = (props) => {
  const { meetingId, userId, children } = props
  //const globalGun = Gun();
  // const globalGun = Gun(['http://localhost:8765/gun']);
  const globalGun = Gun(['http://localhost:8765/gun', 'https://e2thex-meeting-score.herokuapp.com//gun']);
  const [data, setData] = useState({} as Data);
  const currentMeetingNode = globalGun.get(meetingId);
  const currentUserNode = currentMeetingNode.get(userId);
  currentMeetingNode.map().on((d:Data, key) => {
    // create a new candidate for data
    const candidate = d === null
      ? omit(data,key) as Data
      : {...data, [key]: {name: d.name, score: d.score, reason:d.reason}};
    // if the update changed data
    if (!isEqual(candidate[key], data[key]))  {
      setData(candidate);
      console.log(candidate, data);
    } else {
      console.log('same so skip!')
    }
  });	
  return (
    <DataContext.Provider value = {data}>
      <NodeContext.Provider value = {{currentUserNode, currentMeetingNode}} >
        <IdContext.Provider value = {{userId, meetingId}} >
          {children}
        </IdContext.Provider>
      </NodeContext.Provider>
    </DataContext.Provider>
  );
}
export {
  DataContext,
  NodeContext,
  IdContext,
  GunWrapper,
};