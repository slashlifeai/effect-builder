# Directing AI in Development

This guide outlines how to effectively use AI to assist in developing the effect-builder project, focusing on our specification-driven development approach.

## Specification-Driven Development

We use two key specification files to guide development:

### 1. Core Specifications ([SPEC.md](../SPEC.md))

SPEC.md serves as the source of truth for the project's core functionality:

```
"When implementing new features or reviewing code, first check SPEC.md for:
1. Package goals and objectives
2. Core feature requirements
3. Type-safety requirements
4. Error handling patterns"
```

Example usage:

```
"Let's implement the Builder.transform function according to SPEC.md:
1. What are the type safety requirements?
2. How should we handle validation?
3. What error patterns should we follow?"
```

### 2. AI Development Guidelines ([CODINGSTYLE.AI.md](../ai/CODINGSTYLE.AI.md))

CODINGSTYLE.AI.md guides AI in generating consistent, high-quality code:

```
"Before generating code, review CODINGSTYLE.AI.md for:
1. Type safety implementation patterns
2. Schema validation approaches
3. Error handling examples
4. Code structure guidelines"
```

Example usage:

```
"Generate a new builder transformation following CODINGSTYLE.AI.md:
1. Use the type-safe patterns shown
2. Follow the error handling examples
3. Match the code structure guidelines"
```

## Effective AI Direction

### 1. Reference Specifications First

Always start by referencing specifications:

```
"Let's review the specifications before implementation:
1. What does SPEC.md say about this feature?
2. Which patterns from CODINGSTYLE.AI.md apply?
3. Are there similar examples we can follow?"
```

### 2. Validate Against Specifications

Use specifications to validate generated code:

```
"Please verify this implementation against:
1. Type safety requirements in SPEC.md
2. Code patterns in CODINGSTYLE.AI.md
3. Error handling examples provided"
```

### 3. Maintain Consistency

Ensure consistency across the codebase:

```
"Let's ensure this code follows our standards:
1. Matches type safety patterns
2. Uses consistent error handling
3. Follows code structure guidelines"
```

## Common Workflows

### 1. New Feature Implementation

```
"To implement [feature]:
1. Review feature requirements in SPEC.md
2. Check implementation patterns in CODINGSTYLE.AI.md
3. Generate code following these guidelines
4. Validate against specifications"
```

### 2. Code Review

```
"Review this implementation:
1. Does it meet SPEC.md requirements?
2. Does it follow CODINGSTYLE.AI.md patterns?
3. Are error cases handled properly?
4. Is type safety maintained?"
```

### 3. Documentation Updates

```
"Update documentation to:
1. Match SPEC.md terminology
2. Include examples following CODINGSTYLE.AI.md
3. Maintain consistent style"
```

## Best Practices

1. **Always Reference Specs**:

   - Start with SPEC.md for requirements
   - Use CODINGSTYLE.AI.md for implementation details

2. **Maintain Consistency**:

   - Follow established patterns
   - Use provided examples
   - Match existing code style

3. **Iterative Improvement**:
   - Update specs as needed
   - Refine patterns based on usage
   - Document new examples

## Example Dialogue

```
Developer: "We need to implement a new transformation feature."

AI: "Let's start by checking our specifications:

1. From SPEC.md:
   - Type safety requirements
   - Validation patterns
   - Error handling approach

2. From CODINGSTYLE.AI.md:
   - Implementation examples
   - Code structure
   - Testing patterns

Based on these, I'll generate an implementation that follows our established patterns..."
```

## Key Principles

1. Direct AI Effectively:

   - Give clear, specific instructions
   - Provide necessary context
   - Guide the development process
   - Verify AI output quality

2. AI Communication:

   - Be specific in requests
   - Ask for alternatives
   - Request improvements
   - Point out gaps

3. Spec-First Development:
   - Always discuss specifications before coding
   - Let AI analyze and question the specs
   - Refine specs based on AI feedback
   - Use specs as the source of truth

## Building the Foundation

### 1. Core Specification (SPEC.md)

1. Initial structure:

   ```
   "Help me create SPEC.md for effect-builder v0.0.1:
   1. What are the core concepts we need to define?
   2. What type definitions should we include?
   3. How should we structure the API?
   4. What examples demonstrate the key features?"
   ```

2. Define error handling:

   ```
   "For our error handling specification:
   1. What error types do we need?
   2. How should errors integrate with Effect?
   3. What validation patterns should we use?
   4. Show examples of each error scenario"
   ```

3. API patterns:
   ```
   "Define our API patterns in SPEC.md:
   1. How should we structure builders?
   2. What Effect patterns should we use?
   3. How do we ensure type safety?
   4. What are our naming conventions?"
   ```

### 2. AI Guidelines (ai/CODINGSTYLE.AI.md)

1. Basic structure:

   ```
   "Create CODINGSTYLE.AI.md to guide AI development:
   1. What coding patterns should AI follow?
   2. How should AI handle errors?
   3. What documentation format to use?
   4. How to structure and name things?"
   ```

2. Add examples:

   ```
   "Add concrete examples to CODINGSTYLE.AI.md:
   1. Show error handling implementations
   2. Demonstrate type safety patterns
   3. Provide documentation examples
   4. Include common scenarios"
   ```

3. Define constraints:
   ```
   "Add constraints to CODINGSTYLE.AI.md:
   1. What patterns should AI avoid?
   2. When should AI ask for clarification?
   3. How should AI handle edge cases?
   4. What are the performance considerations?"
   ```

### 3. Developer Guidelines (guides/CODINGSTYLE.md)

1. Basic guidelines:

   ```
   "Create CODINGSTYLE.md for developers:
   1. How to use Effect patterns?
   2. What are our error handling rules?
   3. How do we ensure type safety?
   4. What's our documentation format?"
   ```

2. Integration with AI:
   ```
   "Add AI integration guidelines:
   1. How to review AI-generated code?
   2. When to request AI assistance?
   3. How to provide context to AI?
   4. How to verify AI output?"
   ```

## Using the Foundation

### 1. Spec Discussion First

#### Example: Discussing Builder Pattern Spec

Initial discussion:

```
"Let's review the builder pattern spec in SPEC.md:
1. How should we handle partial application in builders?
2. What's the best way to type builder steps?
3. Should we use Effect.gen for builder execution?
4. How do we handle validation between steps?"
```

AI might respond with questions:

```
"I have some questions about the builder spec:
1. Should builders support parallel step execution?
2. How should we handle resource cleanup between steps?
3. Should we provide both sync and async APIs?
4. What's the preferred error channel pattern?"
```

Refining the spec:

```
"Based on your questions, let's update SPEC.md:
1. Add section on parallel execution patterns
2. Define resource management lifecycle
3. Specify Error/Cause hierarchy
4. Add examples of common builder flows"
```

#### Example: Error Handling Spec Review

Initial review:

```
"Review our error handling spec:
1. How should we structure ValidationError for builders?
2. Should we use tagged errors or Error classes?
3. How do we handle error recovery in pipelines?
4. What context should errors include?"
```

Discussing edge cases:

```
"Let's explore error edge cases:
1. What happens if a builder step partially succeeds?
2. How do we handle timeout scenarios?
3. Should we retry failed steps automatically?
4. How do we preserve error context across steps?"
```

#### Example: Type Safety Discussion

Exploring type patterns:

```
"Let's discuss type safety in SPEC.md:
1. How should we type builder configurations?
2. What type constraints should we put on steps?
3. How do we ensure type safety in pipelines?
4. Should we use branded types for validation?"
```

Refining type definitions:

```
"Based on our discussion:
1. Add type examples for common patterns
2. Show how to compose typed builders
3. Document type inference rules
4. Add type safety best practices"
```

### 2. Iterative Spec Refinement

After initial implementation:

```
"Review our implementation against specs:
1. Are there patterns we should add to SPEC.md?
2. Did we discover new edge cases?
3. Should we update type definitions?
4. What examples should we add?"
```

Updating guidelines:

```
"Update CODINGSTYLE.AI.md based on learnings:
1. Add new Effect patterns we discovered
2. Document successful error handling approaches
3. Add type safety patterns that worked well
4. Include real-world usage examples"
```

### 3. Referencing Specifications

When asking AI to implement features:

```
"Based on SPEC.md's error handling section:
1. Implement validation for [feature]
2. Follow the ValidationError pattern
3. Add appropriate test cases
4. Update documentation"
```

### 4. Maintaining Consistency

Regular review:

```
"Review this implementation against our specs:
1. Does it follow SPEC.md patterns?
2. Does it match CODINGSTYLE.AI.md?
3. Is documentation consistent?
4. Are all edge cases handled?"
```

## Version Management

### 1. Starting New Versions

Before starting a new version:

```
"Let's define SPEC.md for version X.Y.Z:
1. What are the new features/changes?
2. Which existing APIs need updates?
3. Are there breaking changes?
4. What's the migration path?"
```

Example for major version:

```
"Update SPEC.md for version 1.0.0:
1. Define stable API surface
2. Document breaking changes from 0.x
3. Specify migration guidelines
4. Add upgrade examples"
```

Example for minor version:

```
"Update SPEC.md for version 0.2.0:
1. Define new builder features
2. Show how they complement existing ones
3. Document new type patterns
4. Add examples of new capabilities"
```

### 2. Version Transition

Discussing implementation approach:

```
"Review version transition plan:
1. Which files need updates?
2. How to maintain backward compatibility?
3. What tests need modification?
4. How to phase the changes?"
```

Managing deprecations:

```
"Plan deprecation strategy:
1. Which APIs to deprecate?
2. What are the replacement patterns?
3. How long is the deprecation period?
4. What warnings to include?"
```

### 3. Version-Specific Guidelines

Update AI guidelines:

```
"Update CODINGSTYLE.AI.md for new version:
1. Add new recommended patterns
2. Update deprecated approaches
3. Refresh best practices
4. Add version-specific examples"
```

### 4. Version Documentation

Maintaining version docs:

```
"For each version update:
1. Keep SPEC.md in sync with changes
2. Document version differences
3. Add migration guides
4. Update troubleshooting guides"
```

## Initial Project Setup

1. Create project structure:

   ```
   "I want to create a new Effect library called effect-builder. Help me:
   1. Set up the initial project structure
   2. Create package.json with Effect ecosystem dependencies
   3. Set up basic README.md
   4. What other files should I create?"
   ```

2. Create core specification:

   ```
   "Now let's create SPEC.md for v0.0.1:
   1. What are the key sections we need?
   2. How should we structure the API documentation?
   3. What examples should we include?
   4. How do we handle versioning?"
   ```

3. Create AI guidelines:

   ```
   "Help me create CODINGSTYLE.AI.md for our AI development:
   1. What patterns should AI follow when writing Effect code?
   2. How should AI handle errors and validation?
   3. What documentation format should AI use?
   4. How should AI structure and name things?"
   ```

   Then refine the guidelines:

   ```
   "Review and enhance CODINGSTYLE.AI.md:
   1. Add concrete examples for each pattern
   2. Include common error handling scenarios
   3. Show documentation examples
   4. Add type safety guidelines"
   ```

   Finally, verify completeness:

   ```
   "Check if CODINGSTYLE.AI.md covers:
   1. All Effect ecosystem patterns
   2. Error handling standards
   3. Documentation requirements
   4. Type safety practices"
   ```

4. Set up documentation structure:

   ```
   "Help me organize our documentation:
   1. What files should go in specs/guides/?
   2. What should go in specs/ai/?
   3. How do we maintain consistency across docs?
   4. How should we version our docs?"
   ```

## Development Workflow

### 1. Adding New Features

1. Specification first:

   ```
   "I want to add [feature] to effect-builder:
   1. How should we update SPEC.md?
   2. What types and interfaces do we need?
   3. How should we handle errors?
   4. What examples should we include?"
   ```

2. Implementation guidance:

   ```
   "Based on the updated spec for [feature]:
   1. What's the most Effect-idiomatic implementation?
   2. How should we structure the code?
   3. What test cases do we need?
   4. Any performance considerations?"
   ```

3. Documentation update:

   ```
   "Now that [feature] is implemented:
   1. What changes needed in SPEC.md?
   2. How should we document it in README.md?
   3. Do we need to update any guides?
   4. What examples should we add?"
   ```

### 2. Version Updates

1. Pre-release planning:

   ```
   "We're planning to release v[X.Y.Z]:
   1. What changes should we include?
   2. Are there breaking changes?
   3. What needs to be updated in SPEC.md?
   4. How should we handle migrations?"
   ```

2. Version bump:

   ```
   "Help me prepare the v[X.Y.Z] release:
   1. What files need version updates?
   2. What should go in CHANGELOG.md?
   3. Do we need to update dependencies?
   4. What documentation needs updating?"
   ```

3. Post-release:

   ```
   "Now that v[X.Y.Z] is released:
   1. What examples need updating?
   2. Are all docs consistent?
   3. Are installation instructions current?
   4. Do we need migration guides?"
   ```

### 3. Error Handling Updates

1. Define new errors:

   ```
   "We need to add error handling for [feature]:
   1. What error types do we need?
   2. How should they integrate with Effect?
   3. What information should errors contain?
   4. How should we document them?"
   ```

2. Implementation:

   ```
   "Help me implement the error handling:
   1. How should we structure the error types?
   2. What's the best way to handle each case?
   3. How do we maintain type safety?
   4. What tests should we add?"
   ```

## Effective Directing Patterns

### 1. Request Abstraction

When you want to improve code or design:

```
"Can this be more abstract? For example:
1. Can this error handling be more generic?
2. Can this interface be more flexible?
3. Can this implementation be more extensible?"
```

### 2. Compare Alternatives

When deciding between different approaches:

```
"Compare these approaches and tell me which is better:
1. Using Schema.union vs Schema.transform
2. Using Effect.gen vs pipe
3. Consider:
   - Type safety
   - Performance
   - Maintainability"
```

### 3. Contextual Implementation

When implementing based on existing context:

```
"Based on the error handling patterns in SPEC.md:
1. Implement error types for this feature
2. Ensure compliance with existing patterns
3. Add corresponding test cases"
```

### 4. Gap Analysis

When you want to ensure completeness:

```
"Point out what I haven't handled:
1. Error cases
2. Edge cases
3. Documentation
4. Tests"
```

## Best Practices

### 1. Providing Context

Always include:

- Current version number
- Relevant file names
- Related features
- Existing patterns

Example:

```
"We're working on effect-builder v0.0.1, specifically the validation feature in src/validation.ts.
Currently, we handle errors using ValidationError from Effect. I want to..."
```

### 2. Iterative Development

1. Start with abstraction:

   ```
   "Can this API design be more abstract? Consider:
   1. More use cases
   2. Future extensibility
   3. Integration with other Effect features"
   ```

2. Compare approaches:

   ```
   "Compare these implementations:
   1. Using Effect.gen
   2. Using pipe operators
   3. Using Schema validators
   Consider type safety and performance"
   ```

3. Implement with context:

   ```
   "Based on our coding style:
   1. How should we implement this feature?
   2. What patterns should we follow?
   3. What tests do we need?"
   ```

4. Verify completeness:

   ```
   "What's missing in this implementation:
   1. Error handling
   2. Documentation
   3. Tests
   4. Examples"
   ```

### 3. Documentation Updates

Always ask for:

1. What needs updating
2. How to maintain consistency
3. What examples to add
4. Version-specific changes

Example:

```
"We just added [feature] in v0.0.1. Help me:
1. Update all relevant documentation
2. Keep it consistent with our style
3. Add practical examples
4. Note any version-specific details"
```

## Common Patterns

### 1. Effect Integration

Ask about:

- Effect patterns
- Type safety
- Error handling
- Performance

### 2. Version Management

Consider:

- Breaking changes
- Migration needs
- Documentation updates
- Dependency updates

### 3. Testing

Focus on:

- Test cases
- Error scenarios
- Edge cases
- Performance tests

## Tips for Effective Directing

1. **Be Clear and Specific**

   - State your requirements clearly
   - Ask for specific improvements
   - Request concrete examples
   - Define success criteria

2. **Guide the Process**

   - Start with high-level direction
   - Break down complex tasks
   - Verify intermediate results
   - Maintain quality standards

3. **Maintain Context**

   - Reference documentation
   - Point to existing patterns
   - Explain constraints
   - Share background information

4. **Ensure Quality**

   - Review generated code
   - Verify type safety
   - Check error handling
   - Validate documentation

5. **Iterate and Improve**
   - Request refinements
   - Compare alternatives
   - Seek optimizations
   - Learn from feedback
