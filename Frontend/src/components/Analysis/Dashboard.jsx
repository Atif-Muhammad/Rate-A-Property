import React from 'react'
import { useParams } from 'react-router-dom';
import {useQuery} from "@tanstack/react-query"
import {APIS} from "../../../config/Config"
function Dashboard() {
    const { postId } = useParams();
    // console.log(postId)

    const {data} = useQuery({queryKey: ['post_analytics', postId], queryFn: ()=> APIS.analyzePost(postId)})
    console.log(data)

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard