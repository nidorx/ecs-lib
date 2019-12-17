import {RocketBodyPage} from "./pages/experiments/rocket/RocketBodyPage";
import {PlanetPage} from "./pages/experiments/planet/PlanetPage";
import {RocketWindowPage} from "./pages/experiments/rocket/RocketWindowPage";
import {RocketWingPage} from "./pages/experiments/rocket/RocketWingPage";
import {MoonPage} from "./pages/experiments/moon/MoonPage";
import {CSGPage} from "./pages/experiments/CSGPage";
import {RocketFullPage} from "./pages/experiments/rocket/RocketFullPage";

/**
 * Todas as páginas usadas para experimentos e ferramentas de desenvolvimento
 *
 * A classe deve possuir uma propriedade estática `title`, manter o padrão "<Group> - Name"
 */
export const PAGES = [
    RocketBodyPage,
    RocketWingPage,
    RocketWindowPage,
    RocketFullPage,
    CSGPage,
    PlanetPage,
    MoonPage
];

// Faz a ordenação dos itens
PAGES.sort((a: any, b: any) => {
    return a.title.localeCompare(b.title);
});
