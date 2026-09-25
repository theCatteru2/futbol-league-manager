export const CONMEBOL_COUNTRIES = [
  { id: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  { id: 'BRA', name: 'Brasil', flag: '🇧🇷' },
  { id: 'URU', name: 'Uruguay', flag: '🇺🇾' },
  { id: 'COL', name: 'Colombia', flag: '🇨🇴' },
  { id: 'CHI', name: 'Chile', flag: '🇨🇱' },
  { id: 'PAR', name: 'Paraguay', flag: '🇵🇾' },
  { id: 'ECU', name: 'Ecuador', flag: '🇪🇨' },
  { id: 'PER', name: 'Perú', flag: '🇵🇪' },
  { id: 'BOL', name: 'Bolivia', flag: '🇧🇴' },
  { id: 'VEN', name: 'Venezuela', flag: '🇻🇪' }
];

export const REGIONAL_NAMES_BY_COUNTRY = {
  ARG: {
    first: ['Mateo', 'Lucas', 'Santiago', 'Facundo', 'Julian', 'Lautaro', 'Nicolas', 'Joaquin', 'Enzo', 'Rodrigo', 'Franco', 'Agustin', 'Tomas', 'Ignacio', 'Nahuel', 'Gonzalo', 'Federico', 'Ramiro', 'Thiago', 'Bautista', 'Leandro'],
    last: ['Gonzalez', 'Rodriguez', 'Lopez', 'Fernandez', 'Perez', 'Gomez', 'Diaz', 'Alvarez', 'Romero', 'Sosa', 'Torres', 'Benitez', 'Acosta', 'Medina', 'Herrera', 'Aguirre', 'Pereyra', 'Gutierrez', 'Gimenez', 'Molina']
  },
  BRA: {
    first: ['Gabriel', 'Lucas', 'Matheus', 'Arthur', 'Vinicius', 'Rodrigo', 'Guilherme', 'Gustavo', 'Felipe', 'Rafael', 'Bruno', 'Thiago', 'Danilo', 'Pedro', 'Everton', 'Luiz', 'Diego', 'Caio', 'Igor', 'Marcos'],
    last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa']
  },
  URU: {
    first: ['Sebastian', 'Diego', 'Federico', 'Gaston', 'Maximiliano', 'Matias', 'Nicolas', 'Emiliano', 'Agustin', 'Facundo', 'Rodrigo', 'Nahuel', 'Santiago', 'Franco', 'Lucas'],
    last: ['Rodriguez', 'Gonzalez', 'Hernandez', 'Suarez', 'Cavani', 'Godin', 'Valverde', 'Bentancur', 'Caceres', 'Coates', 'Gimenez', 'Olivera', 'De La Cruz', 'Torres']
  },
  COL: {
    first: ['James', 'Radamel', 'Luis', 'Juan', 'Carlos', 'Yerry', 'Davinson', 'Wilmar', 'Mateus', 'Jhon', 'Duvan', 'Rafael', 'Javier', 'Camilo', 'Kevin'],
    last: ['Rodriguez', 'Diaz', 'Cuadrado', 'Falcao', 'Mina', 'Sanchez', 'Barrios', 'Uribe', 'Arias', 'Borre', 'Zapata', 'Castillo', 'Muriel', 'Mojica']
  },
  CHI: {
    first: ['Alexis', 'Arturo', 'Gary', 'Claudio', 'Eduardo', 'Charles', 'Mauricio', 'Erick', 'Ben', 'Marcelino', 'Guillermo', 'Paulo', 'Gabriel', 'Vicente'],
    last: ['Sanchez', 'Vidal', 'Medel', 'Bravo', 'Vargas', 'Aranguiz', 'Isla', 'Pulgar', 'Brereton', 'Nunez', 'Maripan', 'Diaz', 'Suazo', 'Valdes']
  },
  PAR: {
    first: ['Gustavo', 'Junior', 'Miguel', 'Angel', 'Derlis', 'Richard', 'Mathias', 'Alejandro', 'Diego', 'Julio', 'Fabian', 'Lorenzo', 'Robert', 'Braian'],
    last: ['Gomez', 'Alonso', 'Almiron', 'Romero', 'Gonzalez', 'Sanchez', 'Villasanti', 'Gamarra', 'Balbuena', 'Enciso', 'Bareiro', 'Rojas', 'Cardozo']
  },
  ECU: {
    first: ['Enner', 'Moises', 'Piero', 'Pervis', 'Felix', 'Angelo', 'Gonzalo', 'Alan', 'Carlos', 'Hernan', 'Jordy', 'Jhegson', 'Jose', 'Kevin'],
    last: ['Valencia', 'Caicedo', 'Hincapie', 'Estupiñan', 'Torres', 'Preciado', 'Plata', 'Franco', 'Gruezo', 'Mena', 'Rodriguez', 'Cifuentes', 'Arboleda']
  },
  PER: {
    first: ['Paolo', 'Pedro', 'Luis', 'Renato', 'Andre', 'Christian', 'Yoshimar', 'Edison', 'Gianluca', 'Alexander', 'Carlos', 'Sergio', 'Marcos'],
    last: ['Guerrero', 'Gallese', 'Advincula', 'Tapia', 'Carrillo', 'Cueva', 'Yotun', 'Flores', 'Lapadula', 'Callens', 'Zambrano', 'Pena', 'Lopez']
  },
  BOL: {
    first: ['Marcelo', 'Carlos', 'Ramiro', 'Henry', 'Leonel', 'Roberto', 'Adrian', 'Moises', 'Erwin', 'Guillermo', 'Jairo', 'Boris', 'Diego'],
    last: ['Martins', 'Lampe', 'Vaca', 'Justiniano', 'Fernandez', 'Jusino', 'Chumacero', 'Algaranaz', 'Saavedra', 'Viscarra', 'Villamil', 'Cespedes']
  },
  VEN: {
    first: ['Salomon', 'Tomas', 'Yangel', 'Darwin', 'Yeferson', 'Romulo', 'Wuilker', 'Nahuel', 'Jhon', 'Cristian', 'Alexander', 'Jose', 'Eduard'],
    last: ['Rondon', 'Rincon', 'Herrera', 'Machis', 'Soteldo', 'Otero', 'Farinez', 'Chancellor', 'Casseres', 'Navarro', 'Angel', 'Bello', 'Cordova']
  }
};

export const TACTICAL_FORMATIONS = {
  '4-4-2': { name: '4-4-2 Clásico', def: 4, med: 4, del: 2, style: 'balanced', bonusVs: '4-3-3' },
  '4-3-3': { name: '4-3-3 Ofensivo', def: 4, med: 3, del: 3, style: 'offensive', bonusVs: '5-3-2' },
  '4-2-3-1': { name: '4-2-3-1 Posesión', def: 4, med: 5, del: 1, style: 'control', bonusVs: '4-4-2' },
  '3-5-2': { name: '3-5-2 Intensidad', def: 3, med: 5, del: 2, style: 'possession', bonusVs: '4-2-3-1' },
  '5-3-2': { name: '5-3-2 Repliegue', def: 5, med: 3, del: 2, style: 'counter', bonusVs: '3-5-2' }
};

export const generateId = () => Math.random().toString(36).substring(2, 11);

export const generateRegionalName = (country = 'ARG') => {
  const pool = REGIONAL_NAMES_BY_COUNTRY[country] || REGIONAL_NAMES_BY_COUNTRY.ARG;
  const first = pool.first[Math.floor(Math.random() * pool.first.length)];
  const last = pool.last[Math.floor(Math.random() * pool.last.length)];
  return `${first} ${last}`;
};

export const createProceduralRoster = (country = 'ARG') => {
  const structure = [
    'ARQ', 'ARQ',
    'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
    'MED', 'MED', 'MED', 'MED', 'MED', 'MED',
    'DEL', 'DEL', 'DEL', 'DEL'
  ];
  return structure.map(pos => ({
    id: generateId(),
    name: generateRegionalName(country),
    pos
  }));
};

const DEFAULT_ROSTERS = {
  'Boca Juniors': [
    { name: 'Sergio Romero', pos: 'ARQ' }, { name: 'Leandro Brey', pos: 'ARQ' },
    { name: 'Luis Advincula', pos: 'DEF' }, { name: 'Lautaro Blanco', pos: 'DEF' },
    { name: 'Marcos Rojo', pos: 'DEF' }, { name: 'Cristian Lema', pos: 'DEF' },
    { name: 'Nicolas Figal', pos: 'DEF' }, { name: 'Lautaro Di Lollo', pos: 'DEF' },
    { name: 'Leandro Paredes', pos: 'MED' }, { name: 'Cristian Medina', pos: 'MED' },
    { name: 'Kevin Zenon', pos: 'MED' }, { name: 'Tomas Belmonte', pos: 'MED' },
    { name: 'Ignacio Miramon', pos: 'MED' }, { name: 'Agustin Martegani', pos: 'MED' },
    { name: 'Edinson Cavani', pos: 'DEL' }, { name: 'Miguel Merentiel', pos: 'DEL' },
    { name: 'Milton Gimenez', pos: 'DEL' }, { name: 'Exequiel Zeballos', pos: 'DEL' }
  ],
  'River Plate': [
    { name: 'Franco Armani', pos: 'ARQ' }, { name: 'Jeremias Ledesma', pos: 'ARQ' },
    { name: 'Fabricio Bustos', pos: 'DEF' }, { name: 'Marcos Acuña', pos: 'DEF' },
    { name: 'German Pezzella', pos: 'DEF' }, { name: 'Paulo Diaz', pos: 'DEF' },
    { name: 'Enzo Diaz', pos: 'DEF' }, { name: 'Leandro Gonzalez Pirez', pos: 'DEF' },
    { name: 'Rodrigo Aliendro', pos: 'MED' }, { name: 'Santiago Simon', pos: 'MED' },
    { name: 'Maximiliano Meza', pos: 'MED' }, { name: 'Ignacio Fernandez', pos: 'MED' },
    { name: 'Manuel Lanzini', pos: 'MED' }, { name: 'Claudio Echeverri', pos: 'MED' },
    { name: 'Miguel Borja', pos: 'DEL' }, { name: 'Facundo Colidio', pos: 'DEL' },
    { name: 'Pablo Solari', pos: 'DEL' }, { name: 'Adam Bareiro', pos: 'DEL' }
  ],
  'Flamengo': [
    { name: 'Agustin Rossi', pos: 'ARQ' }, { name: 'Matheus Cunha', pos: 'ARQ' },
    { name: 'Guillermo Varela', pos: 'DEF' }, { name: 'Ayrton Lucas', pos: 'DEF' },
    { name: 'Leo Ortiz', pos: 'DEF' }, { name: 'Leo Pereira', pos: 'DEF' },
    { name: 'Fabio Bruno', pos: 'DEF' }, { name: 'Alex Sandro', pos: 'DEF' },
    { name: 'Erick Pulgar', pos: 'MED' }, { name: 'Gerson', pos: 'MED' },
    { name: 'Nicolas De La Cruz', pos: 'MED' }, { name: 'Giorgian De Arrascaeta', pos: 'MED' },
    { name: 'Carlos Alcaraz', pos: 'MED' }, { name: 'Allan', pos: 'MED' },
    { name: 'Pedro', pos: 'DEL' }, { name: 'Gabriel Barbosa', pos: 'DEL' },
    { name: 'Bruno Henrique', pos: 'DEL' }, { name: 'Luiz Araujo', pos: 'DEL' }
  ],
  'Palmeiras': [
    { name: 'Weverton', pos: 'ARQ' }, { name: 'Marcelo Lomba', pos: 'ARQ' },
    { name: 'Marcos Rocha', pos: 'DEF' }, { name: 'Joaquin Piquerez', pos: 'DEF' },
    { name: 'Gustavo Gomez', pos: 'DEF' }, { name: 'Murilo', pos: 'DEF' },
    { name: 'Mayke', pos: 'DEF' }, { name: 'Vitor Reis', pos: 'DEF' },
    { name: 'Anibal Moreno', pos: 'MED' }, { name: 'Ze Rafael', pos: 'MED' },
    { name: 'Raphael Veiga', pos: 'MED' }, { name: 'Richard Rios', pos: 'MED' },
    { name: 'Mauricio', pos: 'MED' }, { name: 'Gabriel Menino', pos: 'MED' },
    { name: 'Estevao', pos: 'DEL' }, { name: 'Flaco Lopez', pos: 'DEL' },
    { name: 'Rony', pos: 'DEL' }, { name: 'Felipe Anderson', pos: 'DEL' }
  ],
  'Sao Paulo': [
    { name: 'Rafael', pos: 'ARQ' }, { name: 'Jandrei', pos: 'ARQ' },
    { name: 'Igor Vinicius', pos: 'DEF' }, { name: 'Welington', pos: 'DEF' },
    { name: 'Robert Arboleda', pos: 'DEF' }, { name: 'Alan Franco', pos: 'DEF' },
    { name: 'Rafinha', pos: 'DEF' }, { name: 'Ferraresi', pos: 'DEF' },
    { name: 'Pablo Maia', pos: 'MED' }, { name: 'Alisson', pos: 'MED' },
    { name: 'Lucas Moura', pos: 'MED' }, { name: 'Luciano', pos: 'MED' },
    { name: 'Rodrigo Nestor', pos: 'MED' }, { name: 'Michel Araujo', pos: 'MED' },
    { name: 'Jonathan Calleri', pos: 'DEL' }, { name: 'Ferreira', pos: 'DEL' },
    { name: 'Andre Silva', pos: 'DEL' }, { name: 'Erick', pos: 'DEL' }
  ],
  'Corinthians': [
    { name: 'Hugo Souza', pos: 'ARQ' }, { name: 'Matheus Donelli', pos: 'ARQ' },
    { name: 'Fagner', pos: 'DEF' }, { name: 'Matheus Bidu', pos: 'DEF' },
    { name: 'Felix Torres', pos: 'DEF' }, { name: 'Gustavo Henrique', pos: 'DEF' },
    { name: 'Caca', pos: 'DEF' }, { name: 'Hugo', pos: 'DEF' },
    { name: 'Raniele', pos: 'MED' }, { name: 'Breno Bidon', pos: 'MED' },
    { name: 'Rodrigo Garro', pos: 'MED' }, { name: 'Igor Coronado', pos: 'MED' },
    { name: 'Alex Santana', pos: 'MED' }, { name: 'Jose Martinez', pos: 'MED' },
    { name: 'Memphis Depay', pos: 'DEL' }, { name: 'Yuri Alberto', pos: 'DEL' },
    { name: 'Angel Romero', pos: 'DEL' }, { name: 'Talles Magno', pos: 'DEL' }
  ],
  'Santos': [
    { name: 'Gabriel Brazao', pos: 'ARQ' }, { name: 'Diógenes', pos: 'ARQ' },
    { name: 'JP Chermont', pos: 'DEF' }, { name: 'Gonzalo Escobar', pos: 'DEF' },
    { name: 'Gil', pos: 'DEF' }, { name: 'Joaquim', pos: 'DEF' },
    { name: 'Alex Nascimento', pos: 'DEF' }, { name: 'Aderlan', pos: 'DEF' },
    { name: 'Diego Pituca', pos: 'MED' }, { name: 'Joao Schmidt', pos: 'MED' },
    { name: 'Giuliano', pos: 'MED' }, { name: 'Otero', pos: 'MED' },
    { name: 'Tomas Rincon', pos: 'MED' }, { name: 'Patrick', pos: 'MED' },
    { name: 'Guilherme', pos: 'DEL' }, { name: 'Julio Furch', pos: 'DEL' },
    { name: 'Willian Bigode', pos: 'DEL' }, { name: 'Pedrinho', pos: 'DEL' }
  ],
  'Peñarol': [
    { name: 'Washington Aguerre', pos: 'ARQ' }, { name: 'Guillermo De Amores', pos: 'ARQ' },
    { name: 'Pedro Milans', pos: 'DEF' }, { name: 'Maximiliano Olivera', pos: 'DEF' },
    { name: 'Javier Mendez', pos: 'DEF' }, { name: 'Guzman Rodriguez', pos: 'DEF' },
    { name: 'Leo Coelho', pos: 'DEF' }, { name: 'Camilo Mayada', pos: 'DEF' },
    { name: 'Damian Garcia', pos: 'MED' }, { name: 'Eduardo Darias', pos: 'MED' },
    { name: 'Leonardo Fernandez', pos: 'MED' }, { name: 'Jaime Baez', pos: 'MED' },
    { name: 'Gaston Ramirez', pos: 'MED' }, { name: 'Lucas Hernandez', pos: 'MED' },
    { name: 'Maximiliano Silvera', pos: 'DEL' }, { name: 'Facundo Batista', pos: 'DEL' },
    { name: 'Leonardo Sequeira', pos: 'DEL' }, { name: 'Felipe Avenatti', pos: 'DEL' }
  ],
  'Nacional': [
    { name: 'Luis Mejia', pos: 'ARQ' }, { name: 'Ignacio Suarez', pos: 'ARQ' },
    { name: 'Leandro Lozano', pos: 'DEF' }, { name: 'Gabriel Baez', pos: 'DEF' },
    { name: 'Sebastian Coates', pos: 'DEF' }, { name: 'Diego Polenta', pos: 'DEF' },
    { name: 'Franco Romero', pos: 'DEF' }, { name: 'Mateo Antoni', pos: 'DEF' },
    { name: 'Christian Oliva', pos: 'MED' }, { name: 'Lucas Sanabria', pos: 'MED' },
    { name: 'Alexis Castro', pos: 'MED' }, { name: 'Mauricio Pereyra', pos: 'MED' },
    { name: 'Diego Zabala', pos: 'MED' }, { name: 'Jeronimia Rodriguez', pos: 'MED' },
    { name: 'Ruben Bentancourt', pos: 'DEL' }, { name: 'Gonzalo Carneiro', pos: 'DEL' },
    { name: 'Federico Santander', pos: 'DEL' }, { name: 'Antonio Galeano', pos: 'DEL' }
  ],
  'Colo-Colo': [
    { name: 'Brayan Cortes', pos: 'ARQ' }, { name: 'Fernando De Paul', pos: 'ARQ' },
    { name: 'Mauricio Isla', pos: 'DEF' }, { name: 'Erick Wiemberg', pos: 'DEF' },
    { name: 'Maximiliano Falcon', pos: 'DEF' }, { name: 'Alan Saldivia', pos: 'DEF' },
    { name: 'Emiliano Amor', pos: 'DEF' }, { name: 'Oscar Opazo', pos: 'DEF' },
    { name: 'Esteban Pavez', pos: 'MED' }, { name: 'Arturo Vidal', pos: 'MED' },
    { name: 'Leonardo Gil', pos: 'MED' }, { name: 'Vicente Pizarro', pos: 'MED' },
    { name: 'Carlos Palacios', pos: 'MED' }, { name: 'Gonzalo Castellani', pos: 'MED' },
    { name: 'Javier Correa', pos: 'DEL' }, { name: 'Guillermo Paiva', pos: 'DEL' },
    { name: 'Marcos Bolados', pos: 'DEL' }, { name: 'Lucas Cepeda', pos: 'DEL' }
  ],
  'Olimpia': [
    { name: 'Gaston Olveira', pos: 'ARQ' }, { name: 'Rodrigo Frutos', pos: 'ARQ' },
    { name: 'Cesar Olmedo', pos: 'DEF' }, { name: 'Facundo Zabala', pos: 'DEF' },
    { name: 'Junior Barreto', pos: 'DEF' }, { name: 'Manuel Capasso', pos: 'DEF' },
    { name: 'Hugo Benitez', pos: 'DEF' }, { name: 'Carlos Espinola', pos: 'DEF' },
    { name: 'Richard Ortiz', pos: 'MED' }, { name: 'Alex Franco', pos: 'MED' },
    { name: 'Rodney Redes', pos: 'MED' }, { name: 'Erik Lopez', pos: 'MED' },
    { name: 'Hugo Fernandez', pos: 'MED' }, { name: 'Marcos Gomez', pos: 'MED' },
    { name: 'Lucas Pratto', pos: 'DEL' }, { name: 'Derlis Gonzalez', pos: 'DEL' },
    { name: 'Brian Montenegro', pos: 'DEL' }, { name: 'Kevin Parzajuk', pos: 'DEL' }
  ]
};

export const INITIAL_TEAMS_DATA = [
  // ==========================================
  // ARGENTINA (40 equipos)
  // ==========================================
  { name: 'Argentinos Juniors', country: 'ARG', formation: '4-2-3-1', color: '#dc2626' },
  { name: 'Atletico Tucuman', country: 'ARG', formation: '3-5-2', color: '#0284c7' },
  { name: 'Banfield', country: 'ARG', formation: '4-2-3-1', color: '#16a34a' },
  { name: 'Barracas Central', country: 'ARG', formation: '5-3-2', color: '#ef4444' },
  { name: 'Belgrano', country: 'ARG', formation: '3-5-2', color: '#38bdf8' },
  { name: 'Boca Juniors', country: 'ARG', formation: '4-4-2', color: '#1e3a8a' },
  { name: 'Central Cordoba', country: 'ARG', formation: '5-3-2', color: '#18181b' },
  { name: 'Defensa y Justicia', country: 'ARG', formation: '4-3-3', color: '#15803d' },
  { name: 'Deportivo Riestra', country: 'ARG', formation: '5-3-2', color: '#09090b' },
  { name: 'Estudiantes de La Plata', country: 'ARG', formation: '4-4-2', color: '#b91c1c' },
  { name: 'Gimnasia y Esgrima La Plata', country: 'ARG', formation: '4-4-2', color: '#1e40af' },
  { name: 'Godoy Cruz', country: 'ARG', formation: '4-3-3', color: '#2563eb' },
  { name: 'Huracan', country: 'ARG', formation: '4-2-3-1', color: '#e11d48' },
  { name: 'Independiente', country: 'ARG', formation: '4-2-3-1', color: '#b91c1c' },
  { name: 'Independiente Rivadavia', country: 'ARG', formation: '5-3-2', color: '#1d4ed8' },
  { name: 'Instituto', country: 'ARG', formation: '4-2-3-1', color: '#dc2626' },
  { name: 'Lanus', country: 'ARG', formation: '4-2-3-1', color: '#881337' },
  { name: 'Newells Old Boys', country: 'ARG', formation: '4-3-3', color: '#991b1b' },
  { name: 'Platense', country: 'ARG', formation: '5-3-2', color: '#78350f' },
  { name: 'Racing Club', country: 'ARG', formation: '3-5-2', color: '#0284c7' },
  { name: 'River Plate', country: 'ARG', formation: '4-3-3', color: '#ef4444' },
  { name: 'Rosario Central', country: 'ARG', formation: '4-2-3-1', color: '#eab308' },
  { name: 'San Lorenzo', country: 'ARG', formation: '5-3-2', color: '#1e3a8a' },
  { name: 'Sarmiento', country: 'ARG', formation: '5-3-2', color: '#15803d' },
  { name: 'Talleres', country: 'ARG', formation: '4-3-3', color: '#1e3a8a' },
  { name: 'Tigre', country: 'ARG', formation: '4-3-3', color: '#1d4ed8' },
  { name: 'Union', country: 'ARG', formation: '4-3-3', color: '#dc2626' },
  { name: 'Velez Sarsfield', country: 'ARG', formation: '4-2-3-1', color: '#2563eb' },
  { name: 'San Miguel', country: 'ARG', formation: '4-4-2', color: '#15803d' },
  { name: 'Chacarita', country: 'ARG', formation: '4-4-2', color: '#b91c1c' },
  { name: 'Allboys', country: 'ARG', formation: '4-4-2', color: '#18181b' },
  { name: 'Quilmes', country: 'ARG', formation: '3-5-2', color: '#1e3a8a' },
  { name: 'Ferro Carril Oeste', country: 'ARG', formation: '4-2-3-1', color: '#16a34a' },
  { name: 'Almirante Brown', country: 'ARG', formation: '5-3-2', color: '#eab308' },
  { name: 'Deportivo Moron', country: 'ARG', formation: '4-4-2', color: '#dc2626' },
  { name: 'Nueva Chicago', country: 'ARG', formation: '5-3-2', color: '#15803d' },
  { name: 'San Martin de Tucuman', country: 'ARG', formation: '3-5-2', color: '#b91c1c' },
  { name: 'Patronato', country: 'ARG', formation: '4-4-2', color: '#991b1b' },
  { name: 'Deportivo Madryn', country: 'ARG', formation: '4-4-2', color: '#eab308' },
  { name: 'Los Andes', country: 'ARG', formation: '4-4-2', color: '#dc2626' },

  // ==========================================
  // BRASIL (40 equipos - Série A y Série B)
  // ==========================================
  { name: 'Flamengo', country: 'BRA', formation: '4-2-3-1', color: '#b91c1c' },
  { name: 'Palmeiras', country: 'BRA', formation: '4-3-3', color: '#15803d' },
  { name: 'Botafogo', country: 'BRA', formation: '4-2-3-1', color: '#09090b' },
  { name: 'Atletico Mineiro', country: 'BRA', formation: '3-5-2', color: '#18181b' },
  { name: 'Sao Paulo', country: 'BRA', formation: '4-4-2', color: '#dc2626' },
  { name: 'Fluminense', country: 'BRA', formation: '4-3-3', color: '#881337' },
  { name: 'Gremio', country: 'BRA', formation: '4-2-3-1', color: '#0284c7' },
  { name: 'Internacional', country: 'BRA', formation: '4-2-3-1', color: '#ef4444' },
  { name: 'Cruzeiro', country: 'BRA', formation: '4-3-3', color: '#1d4ed8' },
  { name: 'Corinthians', country: 'BRA', formation: '4-4-2', color: '#18181b' },
  { name: 'Santos', country: 'BRA', formation: '4-3-3', color: '#ffffff' },
  { name: 'Vasco da Gama', country: 'BRA', formation: '4-2-3-1', color: '#09090b' },
  { name: 'Bahia', country: 'BRA', formation: '4-3-3', color: '#0284c7' },
  { name: 'Athletico Paranaense', country: 'BRA', formation: '4-3-3', color: '#b91c1c' },
  { name: 'Fortaleza', country: 'BRA', formation: '4-4-2', color: '#1e3a8a' },
  { name: 'Red Bull Bragantino', country: 'BRA', formation: '4-3-3', color: '#ef4444' },
  { name: 'Cuiaba', country: 'BRA', formation: '5-3-2', color: '#15803d' },
  { name: 'Juventude', country: 'BRA', formation: '4-4-2', color: '#16a34a' },
  { name: 'Vitoria', country: 'BRA', formation: '4-2-3-1', color: '#991b1b' },
  { name: 'Atletico Goianiense', country: 'BRA', formation: '4-3-3', color: '#dc2626' },
  { name: 'Sport Recife', country: 'BRA', formation: '4-2-3-1', color: '#b91c1c' },
  { name: 'Ceara', country: 'BRA', formation: '4-3-3', color: '#18181b' },
  { name: 'America Mineiro', country: 'BRA', formation: '4-4-2', color: '#15803d' },
  { name: 'Goias', country: 'BRA', formation: '4-2-3-1', color: '#16a34a' },
  { name: 'Coritiba', country: 'BRA', formation: '4-4-2', color: '#15803d' },
  { name: 'Avai', country: 'BRA', formation: '4-3-3', color: '#0284c7' },
  { name: 'Chapecoense', country: 'BRA', formation: '5-3-2', color: '#16a34a' },
  { name: 'Novorizontino', country: 'BRA', formation: '4-4-2', color: '#eab308' },
  { name: 'Mirassol', country: 'BRA', formation: '4-2-3-1', color: '#facc15' },
  { name: 'Vila Nova', country: 'BRA', formation: '4-4-2', color: '#dc2626' },
  { name: 'Operario PR', country: 'BRA', formation: '4-4-2', color: '#18181b' },
  { name: 'Ponte Preta', country: 'BRA', formation: '4-2-3-1', color: '#ffffff' },
  { name: 'Guarani', country: 'BRA', formation: '4-4-2', color: '#15803d' },
  { name: 'CRB', country: 'BRA', formation: '4-3-3', color: '#dc2626' },
  { name: 'Paysandu', country: 'BRA', formation: '4-3-3', color: '#38bdf8' },
  { name: 'Botafogo SP', country: 'BRA', formation: '4-4-2', color: '#b91c1c' },
  { name: 'Amazonas FC', country: 'BRA', formation: '4-2-3-1', color: '#facc15' },
  { name: 'Brusque', country: 'BRA', formation: '5-3-2', color: '#eab308' },
  { name: 'Ituano', country: 'BRA', formation: '4-4-2', color: '#dc2626' },
  { name: 'Londrina', country: 'BRA', formation: '4-3-3', color: '#38bdf8' },

  // ==========================================
  // URUGUAY (16 equipos)
  // ==========================================
  { name: 'Peñarol', country: 'URU', formation: '4-2-3-1', color: '#eab308' },
  { name: 'Nacional', country: 'URU', formation: '4-3-3', color: '#1e40af' },
  { name: 'Defensor Sporting', country: 'URU', formation: '4-4-2', color: '#6b21a8' },
  { name: 'Danubio', country: 'URU', formation: '4-4-2', color: '#18181b' },
  { name: 'Liverpool Mvd', country: 'URU', formation: '4-3-3', color: '#1d4ed8' },
  { name: 'Wanderers', country: 'URU', formation: '4-2-3-1', color: '#09090b' },
  { name: 'River Plate Uru', country: 'URU', formation: '4-4-2', color: '#dc2626' },
  { name: 'Boston River', country: 'URU', formation: '4-3-3', color: '#16a34a' },
  { name: 'Cerro Largo', country: 'URU', formation: '5-3-2', color: '#0284c7' },
  { name: 'Racing Montevideo', country: 'URU', formation: '4-2-3-1', color: '#15803d' },
  { name: 'Cerro', country: 'URU', formation: '4-4-2', color: '#0284c7' },
  { name: 'Fenix', country: 'URU', formation: '4-4-2', color: '#7e22ce' },
  { name: 'Progreso', country: 'URU', formation: '4-3-3', color: '#eab308' },
  { name: 'Miramar Misiones', country: 'URU', formation: '4-4-2', color: '#18181b' },
  { name: 'Deportivo Maldonado', country: 'URU', formation: '5-3-2', color: '#b91c1c' },
  { name: 'Rampla Juniors', country: 'URU', formation: '4-4-2', color: '#15803d' },

  // ==========================================
  // COLOMBIA (20 equipos)
  // ==========================================
  { name: 'Atletico Nacional', country: 'COL', formation: '4-3-3', color: '#16a34a' },
  { name: 'Millonarios', country: 'COL', formation: '4-2-3-1', color: '#1d4ed8' },
  { name: 'Independiente Santa Fe', country: 'COL', formation: '3-5-2', color: '#dc2626' },
  { name: 'America de Cali', country: 'COL', formation: '4-2-3-1', color: '#b91c1c' },
  { name: 'Junior', country: 'COL', formation: '4-3-3', color: '#ef4444' },
  { name: 'Deportivo Cali', country: 'COL', formation: '4-4-2', color: '#15803d' },
  { name: 'Independiente Medellin', country: 'COL', formation: '4-2-3-1', color: '#b91c1c' },
  { name: 'Deportes Tolima', country: 'COL', formation: '4-3-3', color: '#881337' },
  { name: 'Once Caldas', country: 'COL', formation: '4-4-2', color: '#ffffff' },
  { name: 'Deportivo Pereira', country: 'COL', formation: '3-5-2', color: '#eab308' },
  { name: 'Atletico Bucaramanga', country: 'COL', formation: '5-3-2', color: '#eab308' },
  { name: 'La Equidad', country: 'COL', formation: '4-4-2', color: '#15803d' },
  { name: 'Aguilas Doradas', country: 'COL', formation: '4-3-3', color: '#ca8a04' },
  { name: 'Deportivo Pasto', country: 'COL', formation: '4-4-2', color: '#dc2626' },
  { name: 'Envigado', country: 'COL', formation: '4-3-3', color: '#ea580c' },
  { name: 'Jaguares de Cordoba', country: 'COL', formation: '5-3-2', color: '#38bdf8' },
  { name: 'Alianza FC', country: 'COL', formation: '4-4-2', color: '#0284c7' },
  { name: 'Boyaca Chico', country: 'COL', formation: '5-3-2', color: '#18181b' },
  { name: 'Patriotas', country: 'COL', formation: '4-4-2', color: '#dc2626' },
  { name: 'Fortaleza CEIF', country: 'COL', formation: '4-2-3-1', color: '#1e3a8a' },

  // ==========================================
  // CHILE (16 equipos)
  // ==========================================
  { name: 'Colo-Colo', country: 'CHI', formation: '4-3-3', color: '#09090b' },
  { name: 'Universidad de Chile', country: 'CHI', formation: '3-5-2', color: '#1e40af' },
  { name: 'Universidad Catolica', country: 'CHI', formation: '4-3-3', color: '#2563eb' },
  { name: 'Union Española', country: 'CHI', formation: '4-2-3-1', color: '#dc2626' },
  { name: 'Palestino', country: 'CHI', formation: '4-3-3', color: '#15803d' },
  { name: 'Everton Viña del Mar', country: 'CHI', formation: '4-4-2', color: '#1e3a8a' },
  { name: 'Coquimbo Unido', country: 'CHI', formation: '4-4-2', color: '#eab308' },
  { name: 'Huachipato', country: 'CHI', formation: '4-3-3', color: '#0284c7' },
  { name: 'O Higgins', country: 'CHI', formation: '4-2-3-1', color: '#38bdf8' },
  { name: 'Cobresal', country: 'CHI', formation: '5-3-2', color: '#ea580c' },
  { name: 'Audax Italiano', country: 'CHI', formation: '4-3-3', color: '#15803d' },
  { name: 'Cobreloa', country: 'CHI', formation: '4-4-2', color: '#ea580c' },
  { name: 'Deportes Iquique', country: 'CHI', formation: '4-3-3', color: '#0284c7' },
  { name: 'Ñublense', country: 'CHI', formation: '4-4-2', color: '#dc2626' },
  { name: 'Union La Calera', country: 'CHI', formation: '4-2-3-1', color: '#b91c1c' },
  { name: 'Deportes Copiapo', country: 'CHI', formation: '5-3-2', color: '#ffffff' },

  // ==========================================
  // PARAGUAY (12 equipos)
  // ==========================================
  { name: 'Olimpia', country: 'PAR', formation: '4-4-2', color: '#18181b' },
  { name: 'Cerro Porteño', country: 'PAR', formation: '4-4-2', color: '#b91c1c' },
  { name: 'Libertad', country: 'PAR', formation: '4-3-3', color: '#09090b' },
  { name: 'Guarani Par', country: 'PAR', formation: '4-2-3-1', color: '#eab308' },
  { name: 'Nacional Par', country: 'PAR', formation: '4-4-2', color: '#1e40af' },
  { name: 'Sportivo Luqueño', country: 'PAR', formation: '4-4-2', color: '#1d4ed8' },
  { name: 'Sportivo Ameliano', country: 'PAR', formation: '4-4-2', color: '#1e3a8a' },
  { name: '2 de Mayo', country: 'PAR', formation: '4-2-3-1', color: '#0284c7' },
  { name: 'Sportivo Trinidense', country: 'PAR', formation: '5-3-2', color: '#eab308' },
  { name: 'Sol de America', country: 'PAR', formation: '4-4-2', color: '#1d4ed8' },
  { name: 'General Caballero JLM', country: 'PAR', formation: '5-3-2', color: '#b91c1c' },
  { name: 'Tacuary', country: 'PAR', formation: '5-3-2', color: '#18181b' },

  // ==========================================
  // ECUADOR (16 equipos)
  // ==========================================
  { name: 'LDU Quito', country: 'ECU', formation: '4-2-3-1', color: '#ffffff' },
  { name: 'Independiente del Valle', country: 'ECU', formation: '3-5-2', color: '#18181b' },
  { name: 'Barcelona SC', country: 'ECU', formation: '4-3-3', color: '#facc15' },
  { name: 'Emelec', country: 'ECU', formation: '4-2-3-1', color: '#1e40af' },
  { name: 'El Nacional', country: 'ECU', formation: '4-4-2', color: '#dc2626' },
  { name: 'Universidad Catolica Ecu', country: 'ECU', formation: '4-3-3', color: '#0284c7' },
  { name: 'Aucas', country: 'ECU', formation: '4-4-2', color: '#eab308' },
  { name: 'Delfin', country: 'ECU', formation: '5-3-2', color: '#1e3a8a' },
  { name: 'Deportivo Cuenca', country: 'ECU', formation: '4-4-2', color: '#b91c1c' },
  { name: 'Macara', country: 'ECU', formation: '4-2-3-1', color: '#0284c7' },
  { name: 'Orense', country: 'ECU', formation: '4-4-2', color: '#16a34a' },
  { name: 'Tecnico Universitario', country: 'ECU', formation: '4-4-2', color: '#dc2626' },
  { name: 'Mushuc Runa', country: 'ECU', formation: '5-3-2', color: '#15803d' },
  { name: 'Imbabura', country: 'ECU', formation: '4-3-3', color: '#1e40af' },
  { name: 'Libertad FC', country: 'ECU', formation: '5-3-2', color: '#ea580c' },
  { name: 'Cumbaya', country: 'ECU', formation: '5-3-2', color: '#1e3a8a' },

  // ==========================================
  // PERÚ (18 equipos)
  // ==========================================
  { name: 'Universitario', country: 'PER', formation: '3-5-2', color: '#fef08a' },
  { name: 'Alianza Lima', country: 'PER', formation: '3-5-2', color: '#1e3a8a' },
  { name: 'Sporting Cristal', country: 'PER', formation: '4-3-3', color: '#38bdf8' },
  { name: 'Melgar', country: 'PER', formation: '4-2-3-1', color: '#991b1b' },
  { name: 'Cienciano', country: 'PER', formation: '4-4-2', color: '#dc2626' },
  { name: 'Cusco FC', country: 'PER', formation: '4-3-3', color: '#eab308' },
  { name: 'Sport Boys', country: 'PER', formation: '4-4-2', color: '#ec4899' },
  { name: 'Cesar Vallejo', country: 'PER', formation: '4-2-3-1', color: '#1d4ed8' },
  { name: 'Deportivo Garcilaso', country: 'PER', formation: '4-3-3', color: '#0284c7' },
  { name: 'ADT Tarma', country: 'PER', formation: '4-4-2', color: '#38bdf8' },
  { name: 'Atletico Grau', country: 'PER', formation: '4-3-3', color: '#facc15' },
  { name: 'Comerciantes Unidos', country: 'PER', formation: '4-4-2', color: '#7e22ce' },
  { name: 'Los Chankas', country: 'PER', formation: '5-3-2', color: '#dc2626' },
  { name: 'Sport Huancayo', country: 'PER', formation: '4-2-3-1', color: '#b91c1c' },
  { name: 'UTC Cajamarca', country: 'PER', formation: '4-4-2', color: '#18181b' },
  { name: 'Carlos Mannucci', country: 'PER', formation: '4-3-3', color: '#1d4ed8' },
  { name: 'Alianza Atletico', country: 'PER', formation: '5-3-2', color: '#1e3a8a' },
  { name: 'Union Comercio', country: 'PER', formation: '4-4-2', color: '#b91c1c' },

  // ==========================================
  // BOLIVIA (16 equipos)
  // ==========================================
  { name: 'Bolivar', country: 'BOL', formation: '4-3-3', color: '#0284c7' },
  { name: 'The Strongest', country: 'BOL', formation: '4-4-2', color: '#eab308' },
  { name: 'Always Ready', country: 'BOL', formation: '4-2-3-1', color: '#dc2626' },
  { name: 'Jorge Wilstermann', country: 'BOL', formation: '4-3-3', color: '#b91c1c' },
  { name: 'Oriente Petrolero', country: 'BOL', formation: '4-4-2', color: '#15803d' },
  { name: 'Blooming', country: 'BOL', formation: '4-2-3-1', color: '#38bdf8' },
  { name: 'San Antonio Bulo Bulo', country: 'BOL', formation: '4-4-2', color: '#15803d' },
  { name: 'Aurora', country: 'BOL', formation: '5-3-2', color: '#0284c7' },
  { name: 'Nacional Potosi', country: 'BOL', formation: '4-4-2', color: '#dc2626' },
  { name: 'Real Tomayapo', country: 'BOL', formation: '5-3-2', color: '#16a34a' },
  { name: 'Universitario de Vinto', country: 'BOL', formation: '4-4-2', color: '#0284c7' },
  { name: 'Guabira', country: 'BOL', formation: '4-3-3', color: '#dc2626' },
  { name: 'Independiente Petrolero', country: 'BOL', formation: '4-4-2', color: '#b91c1c' },
  { name: 'Real Santa Cruz', country: 'BOL', formation: '5-3-2', color: '#18181b' },
  { name: 'Royal Pari', country: 'BOL', formation: '4-3-3', color: '#dc2626' },
  { name: 'GV San Jose', country: 'BOL', formation: '4-4-2', color: '#1e3a8a' },

  // ==========================================
  // VENEZUELA (14 equipos)
  // ==========================================
  { name: 'Deportivo Tachira', country: 'VEN', formation: '4-4-2', color: '#facc15' },
  { name: 'Caracas FC', country: 'VEN', formation: '4-3-3', color: '#dc2626' },
  { name: 'Zamora FC', country: 'VEN', formation: '4-2-3-1', color: '#18181b' },
  { name: 'Deportivo La Guaira', country: 'VEN', formation: '4-3-3', color: '#ea580c' },
  { name: 'Carabobo FC', country: 'VEN', formation: '4-4-2', color: '#881337' },
  { name: 'Academia Puerto Cabello', country: 'VEN', formation: '4-2-3-1', color: '#1e40af' },
  { name: 'Metropolitanos', country: 'VEN', formation: '4-3-3', color: '#7c3aed' },
  { name: 'Monagas SC', country: 'VEN', formation: '4-3-3', color: '#1e3a8a' },
  { name: 'Portuguesa FC', country: 'VEN', formation: '5-3-2', color: '#b91c1c' },
  { name: 'Estudiantes de Merida', country: 'VEN', formation: '4-4-2', color: '#dc2626' },
  { name: 'Rayo Zuliano', country: 'VEN', formation: '4-3-3', color: '#eab308' },
  { name: 'Universidad Central', country: 'VEN', formation: '4-4-2', color: '#1e3a8a' },
  { name: 'Hermanos Colmenarez', country: 'VEN', formation: '5-3-2', color: '#16a34a' },
  { name: 'Angostura FC', country: 'VEN', formation: '5-3-2', color: '#eab308' }
];

export const PREDEFINED_TEAMS = INITIAL_TEAMS_DATA.map((t, index) => {
  const seedRoster = DEFAULT_ROSTERS[t.name];
  const players = seedRoster
    ? seedRoster.map(p => ({ id: generateId(), name: p.name, pos: p.pos }))
    : createProceduralRoster(t.country);

  return {
    id: `t-${index}`,
    name: t.name,
    country: t.country,
    color: t.color || `hsl(${(index * 35) % 360}, 70%, 50%)`,
    shortName: t.name.substring(0, 3).toUpperCase(),
    logoUrl: null,
    formation: t.formation || '4-4-2',
    tacticalVariants: ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2'],
    players
  };
});