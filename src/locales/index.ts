import { enUS, ptBR, es } from "date-fns/locale";
import type { CalendarLocale, TranslationMessages } from "../types";
import type { Locale } from "date-fns";

export const DEFAULT_MESSAGES: TranslationMessages = {
    today: "Today",
    next: "Next",
    prev: "Prev",
    allDay: "All-day",
    week: "Week",
    day: "Day",
    month: "Month",
    list: "List",
    moreEvents: "more",
    noEvents: "No events to display",
    close: "Close",
    viewMonth: "Month",
    viewWeek: "Week",
    viewDay: "Day",
    viewList: "List",
    viewTimeline: "Timeline",
    viewResources: "Resources"
};

export const DEFAULT_LOCALE: CalendarLocale = {
    code: "en-US",
    dateFnsLocale: enUS,
    messages: DEFAULT_MESSAGES
};

export const PT_BR_LOCALE: CalendarLocale = {
    code: "pt-BR",
    dateFnsLocale: ptBR,
    messages: {
        today: "Hoje",
        next: "Próximo",
        prev: "Anterior",
        allDay: "Dia inteiro",
        week: "semana",
        day: "dia",
        month: "mês",
        list: "lista",
        moreEvents: "mais",
        noEvents: "Nenhum evento para exibir",
        close: "Fechar",
        viewMonth: "Mês",
        viewWeek: "Semana",
        viewDay: "Dia",
        viewList: "Agenda",
        viewTimeline: "Linha do tempo",
        viewResources: "Recursos"
    }
};

export const ES_LOCALE: CalendarLocale = {
    code: "es",
    dateFnsLocale: es,
    messages: {
        today: "Hoy",
        next: "Siguiente",
        prev: "Anterior",
        allDay: "Todo el día",
        week: "semana",
        day: "día",
        month: "mes",
        list: "lista",
        moreEvents: "más",
        noEvents: "No hay eventos para mostrar",
        close: "Cerrar",
        viewMonth: "Mes",
        viewWeek: "Semana",
        viewDay: "Día",
        viewList: "Agenda",
        viewTimeline: "Cronograma",
        viewResources: "Recursos"
    }
};

export function getLocaleData(locale?: CalendarLocale | Locale): CalendarLocale {
    if (!locale) return DEFAULT_LOCALE;

    // If it's already a CalendarLocale
    if ("messages" in locale && "dateFnsLocale" in locale) {
        return locale as CalendarLocale;
    }

    // If it's a date-fns Locale, wrap it with default messages
    return {
        code: (locale as Locale).code || "custom",
        dateFnsLocale: locale as Locale,
        messages: DEFAULT_MESSAGES
    };
}
