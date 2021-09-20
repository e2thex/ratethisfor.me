import { find } from "lodash";
import { createContext } from "react";
import db from "./db";
import { predicateIs } from "./find";
import { Term } from "./type";


const AspotContext = createContext(db({sentences:[], date:Date.now()}));
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
}
