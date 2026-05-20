# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

`black_ice_game_engine` is a game engine project currently in its initial setup phase. The repository contains only a README at this stage — no build system, source layout, or test infrastructure has been established yet.

## Branch Conventions

- `main` — stable branch
- Feature and AI-assisted work branches follow the pattern `claude/<description>-<id>`

## Setup

No build system or package manager has been configured yet. Once tooling is chosen, document the following here:

- How to install dependencies
- How to build the project
- How to run the test suite (full and single-test)
- How to run the linter/formatter

## Architecture

No source structure exists yet. When the engine architecture is defined, document the following here:

- Language(s) and primary runtime/compiler
- Directory layout and what each top-level folder owns
- Core subsystems (renderer, ECS, audio, input, asset pipeline, etc.) and how they interact
- Any external dependencies or third-party engines/frameworks being wrapped
