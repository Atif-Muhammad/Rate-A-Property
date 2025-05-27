import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { APIS } from "../../../config/Config";
import CustomPieChart from "../../pages/statistics/AnalyticsGrap";
// import FormatterDemo from "../../pages/statistics/AnalyticsGrap";
function Dashboard() {
  const { postId } = useParams();
  // console.log(postId)

  const { data } = useQuery({
    queryKey: ["post_analytics", postId],
    queryFn: () => APIS.analyzePost(postId),
  });
  // console.log(data);


  return (
    <div>
      {/* <FormatterDemo /> */}
      <CustomPieChart data={data?.data}/>
    </div>
  );
}

export default Dashboard;
