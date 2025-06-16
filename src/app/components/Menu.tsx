"use client";

import Task from "./Task";

const Menu = () => {
  return (
    <div className="flex flex-col items-center">
      <Task taskType="walletConnect" />
      <Task taskType="spotifyConnect" />
      <Task taskType="mintNFT" />
    </div>
  );
};

export default Menu;
