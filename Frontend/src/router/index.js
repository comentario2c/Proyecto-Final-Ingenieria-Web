import { createRouter, createWebHistory } from "vue-router";

// Auth components
import login from "../components/login.vue";
import register from "../components/register.vue";

// Admin layout
import AdminLayout from "../components/admin/AdminLayout.vue";

// Admin views
import DashboardView from "../views/admin/DashboardView.vue";
import EquiposView from "../views/admin/EquiposView.vue";
import SalasView from "../views/admin/SalasView.vue";

const routes = [
    // LOGIN
    {
        path: "/",
        name: "login",
        component: login,
    },

    // REGISTER
    {
        path: "/register",
        name: "register",
        component: register,
    },

    // ADMIN AREA
    {
        path: "/admin",
        component: AdminLayout,
        children: [
            {
                path: "",
                name: "admin-dashboard",
                component: DashboardView, // <<--- SE VE CUANDO ENTRAS A /admin
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
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
