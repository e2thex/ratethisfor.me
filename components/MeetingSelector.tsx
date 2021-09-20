import React, { useState } from "react";
const MeetingSelector = () => {
	const [newId, setNewId ] = useState('');
	// const history = useHistory();
	return (
	  <form onSubmit={(e) => {
      e.preventDefault();
      window.location.replace(`?id=${encodeURI(newId)}`)
    }}>
	    <input className = "text-center border w-11/12 p-2 text-lg" placeholder="Enter Meeting Name" value = {newId} onChange = {(e) => setNewId(e.currentTarget.value)} />
	    <input className = "w-1/12 text-lg border p-2 bg-grey" type="submit" value = "Go" />  
	  </form>
	)
}
export default MeetingSelector
