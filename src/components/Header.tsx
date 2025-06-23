import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import Login from "./Login";
import { Button } from "./ui/button";

const Header = () => {
  const { username, logout } = useAuth();

  return (
    <header className="flex justify-between bg-white p-6 shadow-md sticky top-0 z-10">
      <h1 className="text-3xl font-bold">State Management Test</h1>
      <div className="flex items-center gap-4">
        {username ? (
          <>
            <span className="text-gray-700">Welcome, {username}</span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Login</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
                <DialogDescription>Login into your account.</DialogDescription>
              </DialogHeader>
              <Login />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  );
};

export default Header;
