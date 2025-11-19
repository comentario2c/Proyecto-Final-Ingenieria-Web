import { createRouter, createWebHistory } from "vue-router";

// Auth components
import login from "../components/login.vue";
import register from "../components/register.vue";
import Alumnos from '../views/Alumnos/Alumnos.vue';

// Admin layout
import AdminLayout from "../components/admin/AdminLayout.vue";

// Admin views
import DashboardView from "../views/admin/DashboardView.vue";
import EquiposView from "../views/admin/EquiposView.vue";
import SalasView from "../views/admin/SalasView.vue";


const router = createRouter ({
    history: createWebHistory(),
    routes:[
        {
            path: "/login",
            name: "login",
            component: login
        },
        {
            path: "/register",
            name: "register",
            component: register,
        },
        {
            path: "/",
            name: "alumnos",
            component: Alumnos
        },
        {
            path: "/admin",
            component: AdminLayout,
            children: [
                {
                path: "",
                name: "admin-dashboard",
                component: DashboardView,
                },
                {
                    path: "equipos",
                    name: "admin-equipos",
                    component: EquiposView,
                },
                {
                    path: "salas",
                    name: "admin-salas",
                    component: SalasView,
                }
            ]
        }
    ],
})

export default router
