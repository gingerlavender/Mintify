const Header = () => {
  return (
    <header className="font-[Inter] flex justify-around flex-col items-center md:flex-row">
      <p className="font-[100] text-6xl">Mintify</p>
      <p className="font-[300] text-xl mt-1 md:text-3xl md:mt-0">
        Mint <em>your</em> music taste.
      </p>
    </header>
  );
};

export default Header;
