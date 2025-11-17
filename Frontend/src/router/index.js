import { createRouter, createWebHistory } from 'vue-router';

import login from "../components/login.vue";
import register from "../components/register.vue";
import alumno from "../components/alumno.vue"

const router = createRouter ({
    history: createWebHistory(),
    routes:[
        {
            path: "/",
            name: "login",
            component: login
        },
        {
            path: "/register",
            name: "register",
            component: register,
        },
        {
            path: "/alumno",
            name: "alumno",
            component: alumno,
        }
    ],
})

export default router