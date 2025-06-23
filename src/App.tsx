import Header from "./components/Header";
import PlayerList from "./components/PlayerList";
import TeamList from "./components/TeamList";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col-reverse w-full lg:flex-row gap-10 md:gap-5 p-6">
        <PlayerList />
        <TeamList />
      </div>
    </div>
  );
};

export default App;
