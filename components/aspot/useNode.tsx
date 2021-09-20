import { useState } from "react";
import db from "./db";
import { AspotNode, PredicateNode } from "./type";

const useNode = (node:AspotNode) => {
	const [v, setV ] = useState(node.val())
  node.on(setV);
  return v;
}
export default useNode;