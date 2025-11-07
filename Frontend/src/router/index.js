import { createRouter, createWebHistory } from 'vue-router';
import login from "../components/login.vue";

const router = createRouter ({
    history: createWebHistory(),
    routes:[
        {
            path: "/",
            name: "login",
            component: login
        },
    ],
})

export default router