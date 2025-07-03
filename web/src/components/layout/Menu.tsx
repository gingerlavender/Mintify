import Task from "../ui/Task";

const Menu = () => {
  return (
    <div className="flex flex-col items-center">
      <Task taskType="spotifyConnect" />
      <Task taskType="walletConnect" />
      <Task taskType="mintNFT" />
    </div>
  );
};

export default Menu;
