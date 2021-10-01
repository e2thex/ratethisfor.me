import { find } from "lodash";
import { createContext, useContext } from "react";
import { aspot } from "@aspot/core";
import db from "./db";
import { predicateIs } from "./find";
import { Term } from "./type";


const AspotContext = createContext(aspot());
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
