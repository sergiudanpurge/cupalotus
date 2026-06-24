export type Dict = {
  banner: {
    subtitle:   string;
    location:   string;
    date:       string;
    categories: string;
    teams:      string;
    days:       string;
    format:     string;
  };
  home: {
    ageCategories: string;
    bornIn:        string;
    matchesOf:     string;
  };
  nav: {
    visitors:         string;
    admin:            string;
    backToCategories: string;
  };
  tabs: {
    clasament:  string;
    program:    string;
    calificari: string;
    golgheteri: string;
    podium:     string;
  };
  standings: {
    matches: string;
    team:    string;
    played:  string;
    won:     string;
    drawn:   string;
    lost:    string;
    gm:      string;
    gp:      string;
    gj:      string;
    pts:     string;
    legend:  string;
  };
  schedule: {
    Vineri:      string;
    "Sâmbătă":   string;
    "Duminică":  string;
    fullTime:    string;
    group:       string;
    noMatches:   string;
    pen:         string;
    fieldPrefix: string;
  };
  brackets: {
    semifinals: string;
    finals:     string;
    places:     string;
    winner:     string;
    loser:      string;
    bracket:    string;
    grandFinal: string;
    smallFinal: string;
    final:      string;
  };
  scorers: {
    player:  string;
    team:    string;
    goals:   string;
    no:      string;
    noGoals: string;
  };
  podium: {
    title:       string;
    pending:     string;
    provisional: string;
    place:       string;
  };
};

export const ro: Dict = {
  banner: {
    subtitle:   "Turneu de fotbal juvenil",
    location:   "Baza Sportivă C.S. Lotus Băile Felix",
    date:       "28 – 30 Mai 2027",
    categories: "Categorii",
    teams:      "Echipe",
    days:       "Zile",
    format:     "format pe grupe + calificări",
  },
  home: {
    ageCategories: "Categorii de vârstă",
    bornIn:        "An naștere",
    matchesOf:     "meciuri jucate",
  },
  nav: {
    visitors:         "Vizitatori",
    admin:            "Administrator",
    backToCategories: "← Categorii",
  },
  tabs: {
    clasament:  "Clasament",
    program:    "Program",
    calificari: "Calificări",
    golgheteri: "Golgheteri",
    podium:     "Podium",
  },
  standings: {
    matches: "meciuri",
    team:    "Echipă",
    played:  "M",
    won:     "V",
    drawn:   "E",
    lost:    "Î",
    gm:      "GM",
    gp:      "GP",
    gj:      "GJ",
    pts:     "P",
    legend:  "Legendă",
  },
  schedule: {
    Vineri:      "Vineri",
    "Sâmbătă":   "Sâmbătă",
    "Duminică":  "Duminică",
    fullTime:    "Final",
    group:       "Gr.",
    noMatches:   "Nu există meciuri programate.",
    pen:         "pen.",
    fieldPrefix: "T",
  },
  brackets: {
    semifinals: "Semifinale",
    finals:     "Finale",
    places:     "Locuri",
    winner:     "Câșg.",
    loser:      "Înv.",
    bracket:    "Tablou",
    grandFinal: "Finala Mare",
    smallFinal: "Finala Mică",
    final:      "Finala",
  },
  scorers: {
    player:  "Jucător",
    team:    "Echipă",
    goals:   "Goluri",
    no:      "Nr.",
    noGoals: "Nu există goluri înregistrate.",
  },
  podium: {
    title:       "Podiumul final",
    pending:     "Disponibil după finalizarea tuturor meciurilor eliminatorii de duminică.",
    provisional: "proviz.",
    place:       "Loc",
  },
};
