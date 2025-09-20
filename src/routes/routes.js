import Login from "./Login.svelte";
import Dashboard from "./Dashboard.svelte";

export const routes = {
    "/": Login,
    "/home/*": Dashboard,
}