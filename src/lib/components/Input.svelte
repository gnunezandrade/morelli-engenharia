<script lang="ts">
	import masked from '$lib/utils/mask';
	import type { SuiteResult } from 'vest';

	export let mask: string | RegExp = '';
	export let placeholder = '';
	export let value: string = '';
	export let name: string;
	export let type: 'text' | 'textArea' | 'password' = 'text';
	export let disabled = false;
	export let autocomplete = 'off';
	export let dataCyType = 'text';
	export let result: SuiteResult | undefined = undefined;

	$: error = result?.getErrors()[name]?.length ?? 0 > 0;
</script>

<div class="form-control w-full py-2">
	<label class="label" for={name}>
		<span class="label-text">{placeholder}</span>
	</label>

	{#if type === 'textArea'}
		<textarea
			{placeholder}
			{name}
			class="textarea textarea-bordered w-full"
			class:textarea-error={error}
			class:textarea-primary={!error}
			bind:value
			{disabled}
			{autocomplete}
			data-cy={!disabled && `input-${name}`}
			data-cy-type={dataCyType}
		/>
	{:else if type === 'text'}
		<input
			type="text"
			{name}
			{placeholder}
			use:masked={mask}
			class="input input-bordered w-full"
			class:input-error={error}
			class:input-primary={!error}
			bind:value
			{disabled}
			{autocomplete}
			data-cy={!disabled && `input-${name}`}
			data-cy-type={dataCyType}
		/>
	{:else if type === 'password'}
		<input
			type="password"
			{name}
			{placeholder}
			use:masked={mask}
			class="input input-bordered w-full"
			class:input-error={error}
			class:input-primary={!error}
			bind:value
			{disabled}
			{autocomplete}
			data-cy={!disabled && `input-${name}`}
			data-cy-type={dataCyType}
		/>
	{/if}

	{#if result && result.getErrors()[name]}
		<label class="label" for={name}>
			<span data-cy="span-error-message" class="label-text-alt text-error"
				>{result.getErrors()[name][0]}</span
			>
		</label>
	{/if}
</div>
