import React from "react";
import { useCampaignConfig } from "../../hooks/useConfig";
import CounterI from "../Counter";

export default function Counter(props) {
  const config = useCampaignConfig();
  return <CounterI actionPage={config.component.eci.actionpage} />;
}
