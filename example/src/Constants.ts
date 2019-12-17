import {KeyboardPage} from "./pages/KeyboardPage";
import {TimescalePage} from "./pages/TimescalePage";

/**
 * Todas as páginas usadas para experimentos e ferramentas de desenvolvimento
 *
 * A classe deve possuir uma propriedade estática `title`, manter o padrão "<Group> - Name"
 */
export const PAGES = [
    KeyboardPage,
    TimescalePage
];

// Faz a ordenação dos itens
PAGES.sort((a: any, b: any) => {
    return a.title.localeCompare(b.title);
});
