CREATE TABLE ingredients (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    inci_name TEXT NOT NULL,
    description TEXT,
    description_source TEXT
);

CREATE UNIQUE INDEX ingredients_inci_name_unique ON ingredients (lower(inci_name));

CREATE TABLE ingredient_aliases (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ingredient_id BIGINT NOT NULL REFERENCES ingredients (id) ON DELETE CASCADE,
    alias TEXT NOT NULL
);

CREATE UNIQUE INDEX ingredient_aliases_alias_unique ON ingredient_aliases (lower(alias));

CREATE TABLE functions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

CREATE UNIQUE INDEX functions_name_unique ON functions (lower(name));

CREATE TABLE ingredient_functions (
    ingredient_id BIGINT NOT NULL REFERENCES ingredients (id) ON DELETE CASCADE,
    function_id BIGINT NOT NULL REFERENCES functions (id) ON DELETE CASCADE,
    PRIMARY KEY (ingredient_id, function_id)
);

CREATE TABLE product_categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_leave_on BOOLEAN NOT NULL
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
