<script>
    import "@picocss/pico"
    import "./app.css"
    import {routes} from "./routes/routes.js";

    import Router from "svelte-spa-router";
</script>

<Router {routes}/>

<style>
</style>
