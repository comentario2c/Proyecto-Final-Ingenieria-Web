import { createRouter, createWebHistory } from 'vue-router';

import login from "../components/login.vue";
import register from "../components/register.vue";
import Alumnos from '../views/Alumnos/Alumnos.vue'

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
            component: register
        },
        {
            path: '/alumnos',
            name: 'alumnos',
            component: Alumnos
        },
    ],
})

export default router