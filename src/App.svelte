<script>
	import Dropzone from "svelte-file-dropzone";
	import axios from "axios";
	import { Circle2 } from "svelte-loading-spinners";
	import Fa from "svelte-fa";
	import { faFile } from "@fortawesome/free-solid-svg-icons";

	let brokenURLs;

	let files = {
		accepted: [],
		rejected: [],
	};

	let progress = {
		loading: false,
		percentage: 0,
	};

	let results = {
		urls: [],
	};

	function handleFilesSelect(e) {
		const { acceptedFiles, fileRejections } = e.detail;
		files.accepted = [...files.accepted, ...acceptedFiles];
		files.rejected = [...files.rejected, ...fileRejections];
	}

	async function handleUpload(e) {
		if (progress.loading) {
			return;
		}
		results.urls = [];
		progress.loading = true;
		progress.percentage = 0;
		let fileCount = 0;
		let fileTotal = files.accepted.length;
		function markCompleted() {
			fileCount += 1;
			progress.percentage = (fileCount / fileTotal) * 100;
			if (fileCount == fileTotal) {
				progress.loading = false;
			}
		}

		for (let file of files.accepted) {
			let fileContent = await file.text();
			axios
				.post(
					"https://alphabetsxyptiysl-xliff.functions.fnc.fr-par.scw.cloud",
					{ xliff_content: fileContent }
				)
				.then((resp) => {
					console.log("OK");
					console.log("Response", resp);
					for (var [url, valid] of Object.entries(resp.data.urls)) {
						console.log(url, valid);
						if (!valid) {
							if (!results.urls.includes(url)) {
								results.urls = [...results.urls, url];
							}
						}
					}
					markCompleted();
				});
		}
	}

	$: uploadDisabled = progress.loading || files.accepted.length == 0;

	function copyURLs() {
		window.getSelection().selectAllChildren(brokenURLs);
		document.execCommand("copy");
	}

	import "bulma/css/bulma.css";
	import { Button } from "svelma";
</script>

<main>
	<h1>XLIFF URLs Validator</h1>
	<p>Drop your .xliff files and retrieve a list of dead / broken URLs</p>

	<Dropzone on:drop={handleFilesSelect} />
	<br />
	<Button type="is-primary" on:click={handleUpload} disabled={uploadDisabled}
		>Upload files</Button
	>
	<br />
	{#if progress.loading}
		<div class="columns is-vcentered">
			<div class="column is-1">
				<Circle2 size="60" color="#FF3E00" unit="px" duration="1s" />
			</div>
			<div class="column">
				<progress
					class="progress is-primary"
					value={progress.percentage}
					max="100">{progress.percentage}%</progress
				>
			</div>
		</div>
	{/if}

	<div class="box">
		<h2>Files that will be uploaded</h2>
		<ul>
			{#each files.accepted as item}
				<li><Fa icon={faFile} /> {item.name}</li>
			{/each}
		</ul>
	</div>

	{#if !progress.loading && results.urls.length > 0}
		<div class="box">
			<h2>Broken URLs</h2>

			<Button type="is-primary" on:click={copyURLs}>Copy links</Button>

			<div class="box">
				<ul bind:this={brokenURLs}>
					{#each results.urls as url}
						<li><a href={url}><code>{url}</code></a></li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</main>

<style>
	body {
		background-color: "#EBEBEB";
	}
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	h2 {
		color: #5c1903;
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 50;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
