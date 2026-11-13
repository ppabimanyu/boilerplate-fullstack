# Boilerplate Fullstack

A general-purpose fullstack template. This glossary fixes the frontend component vocabulary used by the template.

## Language

**Primitive**:
A shadcn-generated UI element that the project treats as vendored.
_Avoid_: Base component, atom, UI kit component

**Shared component**:
A domain-neutral composition used by more than one page or template project.
_Avoid_: Common component, generic component, widget

**Block**:
A page-level section assembled from primitives and shared components, owned by one feature until a second consumer needs it.
_Avoid_: Section, module, widget, template

**Feature**:
A user-facing capability with its own route and data.
_Avoid_: Module, domain

**Template consumer**:
A new project created from this boilerplate.
_Avoid_: Downstream project, client
