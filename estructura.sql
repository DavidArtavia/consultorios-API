--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_Usuarios_rol; Type: TYPE; Schema: public; Owner: david
--

CREATE TYPE public."enum_Usuarios_rol" AS ENUM (
    'administrador',
    'profesor',
    'estudiante'
);


ALTER TYPE public."enum_Usuarios_rol" OWNER TO david;

--
-- Name: enum_casos_estado; Type: TYPE; Schema: public; Owner: david
--

CREATE TYPE public.enum_casos_estado AS ENUM (
    'activo',
    'asesoria',
    'terminado',
    'archivado',
    'asignado'
);


ALTER TYPE public.enum_casos_estado OWNER TO david;

--
-- Name: enum_clientes_sexo; Type: TYPE; Schema: public; Owner: david
--

CREATE TYPE public.enum_clientes_sexo AS ENUM (
    'M',
    'F'
);


ALTER TYPE public.enum_clientes_sexo OWNER TO david;

--
-- Name: enum_usuarios_rol; Type: TYPE; Schema: public; Owner: david
--

CREATE TYPE public.enum_usuarios_rol AS ENUM (
    'administrador',
    'profesor',
    'estudiante'
);


ALTER TYPE public.enum_usuarios_rol OWNER TO david;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: david
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO david;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asignaciondecasos; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.asignaciondecasos (
    id_asignacion character varying(255) NOT NULL,
    id_caso character varying(255),
    id_estudiante character varying(255),
    fecha_asignacion date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE public.asignaciondecasos OWNER TO david;

--
-- Name: avances; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.avances (
    id_avance character varying(255) NOT NULL,
    id_caso character varying(255),
    fecha_avance date DEFAULT CURRENT_DATE NOT NULL,
    gestion text,
    resultado_concreto text,
    evidencia text,
    observaciones text
);


ALTER TABLE public.avances OWNER TO david;

--
-- Name: casos; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.casos (
    id_caso character varying(255) NOT NULL,
    id_cliente character varying(255),
    id_contraparte character varying(255),
    expediente character varying(50) NOT NULL,
    ley_7600 boolean DEFAULT false,
    tipo_proceso character varying(255),
    cuantia_proceso numeric(15,2),
    aporte_comunidad numeric(15,2),
    sintesis_hechos text,
    fecha_creacion date DEFAULT CURRENT_DATE NOT NULL,
    etapa_proceso text,
    evidencia text,
    estado character varying(25) DEFAULT 'asesoria'::character varying NOT NULL,
    CONSTRAINT casos_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'asesoria'::character varying, 'terminado'::character varying, 'archivado'::character varying, 'asignado'::character varying])::text[])))
);


ALTER TABLE public.casos OWNER TO david;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.clientes (
    id_cliente character varying(255) NOT NULL,
    sexo character(1),
    ingreso_economico numeric(15,2),
    fecha_registro date DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT clientes_sexo_check CHECK ((sexo = ANY (ARRAY['M'::bpchar, 'F'::bpchar])))
);


ALTER TABLE public.clientes OWNER TO david;

--
-- Name: contraparte; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.contraparte (
    id_contraparte character varying(255) NOT NULL,
    detalles text
);


ALTER TABLE public.contraparte OWNER TO david;

--
-- Name: direcciones; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.direcciones (
    id_direccion character varying(255) NOT NULL,
    id_persona character varying(255),
    direccionexacta character varying(200),
    canton character varying(55) NOT NULL,
    distrito character varying(55) NOT NULL,
    localidad character varying(55) NOT NULL,
    provincia character varying(55) NOT NULL
);


ALTER TABLE public.direcciones OWNER TO david;

--
-- Name: estudiantes; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.estudiantes (
    id_estudiante character varying(255) NOT NULL,
    carnet character varying(20) NOT NULL,
    fecha_inscripcion date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE public.estudiantes OWNER TO david;

--
-- Name: informes; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.informes (
    id_informe character varying(255) NOT NULL,
    id_estudiante character varying(255),
    id_caso character varying(255),
    contenido_informe text,
    fecha_entrega date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE public.informes OWNER TO david;

--
-- Name: persona; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.persona (
    id_persona character varying(255) NOT NULL,
    primernombre character varying(50) NOT NULL,
    segundonombre character varying(50),
    primerapellido character varying(50) NOT NULL,
    segundoapellido character varying(50) NOT NULL,
    cedula character varying(20) NOT NULL,
    telefono character varying(20),
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.persona OWNER TO david;

--
-- Name: profesores; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.profesores (
    id_profesor character varying(255) NOT NULL,
    especialidad character varying(50),
    fecha_contratacion date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE public.profesores OWNER TO david;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: david
--

CREATE TABLE public.usuarios (
    id_usuario character varying(255) NOT NULL,
    id_persona character varying(255),
    email character varying(50) NOT NULL,
    password_hash text NOT NULL,
    rol character varying(50) NOT NULL,
    username character varying(50) NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY ((ARRAY['administrador'::character varying, 'profesor'::character varying, 'estudiante'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO david;

--
-- Name: asignaciondecasos asignaciondecasos_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.asignaciondecasos
    ADD CONSTRAINT asignaciondecasos_pkey PRIMARY KEY (id_asignacion);


--
-- Name: avances avances_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.avances
    ADD CONSTRAINT avances_pkey PRIMARY KEY (id_avance);


--
-- Name: casos casos_expediente_key; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_expediente_key UNIQUE (expediente);


--
-- Name: casos casos_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_pkey PRIMARY KEY (id_caso);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente);


--
-- Name: contraparte contraparte_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.contraparte
    ADD CONSTRAINT contraparte_pkey PRIMARY KEY (id_contraparte);


--
-- Name: direcciones direcciones_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_pkey PRIMARY KEY (id_direccion);


--
-- Name: estudiantes estudiantes_carnet_key; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_carnet_key UNIQUE (carnet);


--
-- Name: estudiantes estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_pkey PRIMARY KEY (id_estudiante);


--
-- Name: informes informes_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.informes
    ADD CONSTRAINT informes_pkey PRIMARY KEY (id_informe);


--
-- Name: persona persona_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_pkey PRIMARY KEY (id_persona);


--
-- Name: profesores profesores_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_pkey PRIMARY KEY (id_profesor);


--
-- Name: usuarios unique_username; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: asignaciondecasos asignaciondecasos_id_caso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.asignaciondecasos
    ADD CONSTRAINT asignaciondecasos_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES public.casos(id_caso) ON DELETE CASCADE;


--
-- Name: asignaciondecasos asignaciondecasos_id_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.asignaciondecasos
    ADD CONSTRAINT asignaciondecasos_id_estudiante_fkey FOREIGN KEY (id_estudiante) REFERENCES public.estudiantes(id_estudiante) ON DELETE CASCADE;


--
-- Name: avances avances_id_caso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
ALTER TABLE ONLY public.avances
    ADD CONSTRAINT avances_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES public.casos(id_caso);


--
-- Name: casos casos_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente);


--
-- Name: casos casos_id_contraparte_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.casos
    ADD CONSTRAINT casos_id_contraparte_fkey FOREIGN KEY (id_contraparte) REFERENCES public.contraparte(id_contraparte);


--
-- Name: clientes clientes_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: contraparte contraparte_id_contraparte_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.contraparte
    ADD CONSTRAINT contraparte_id_contraparte_fkey FOREIGN KEY (id_contraparte) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: direcciones direcciones_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: estudiantes estudiantes_id_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_id_estudiante_fkey FOREIGN KEY (id_estudiante) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: informes informes_id_caso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.informes
    ADD CONSTRAINT informes_id_caso_fkey FOREIGN KEY (id_caso) REFERENCES public.casos(id_caso);


--
-- Name: informes informes_id_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.informes
    ADD CONSTRAINT informes_id_estudiante_fkey FOREIGN KEY (id_estudiante) REFERENCES public.estudiantes(id_estudiante);


--
-- Name: profesores profesores_id_profesor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_profesor_fkey FOREIGN KEY (id_profesor) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- Name: usuarios usuarios_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: david
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

