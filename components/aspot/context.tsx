import { find } from "lodash";
import { createContext, useContext } from "react";
import db from "./db";
import { predicateIs } from "./find";
import { Term } from "./type";


const AspotContext = createContext(db({sentences:[], date:Date.now()}));
const useAspotContext = () => useContext(AspotContext);
const AsoptWrapper = (props) => {
	const {db, children} = props;
  return (
    <AspotContext.Provider value={db}>
      {children}
    </AspotContext.Provider>
  )
}
export {
  AspotContext,
  AsoptWrapper,
  useAspotContext,
}
