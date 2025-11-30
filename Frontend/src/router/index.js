import { createRouter, createWebHistory } from "vue-router";

// Auth components
import login from "../views/auth/loginGoogle.vue";
import register from "../views/auth/registerRut.vue";
import Alumnos from '../views/Alumnos/Alumnos.vue';
import profesor from "../views/profesores/profesorPrestamo.vue";

// Admin layout
import AdminLayout from "../components/admin/AdminLayout.vue";

// Admin views
import DashboardView from "../views/admin/DashboardView.vue";
import EquiposView from "../views/admin/EquiposView.vue";
import SalasView from "../views/admin/SalasView.vue";

const router = createRouter({
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
            path: "/alumnos",
            name: "alumnos",
            component: Alumnos
        },
        {
            path: "/profesores",
            name: "profesoresPrestamo",
            component: profesor
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
