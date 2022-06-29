const core = require('@actions/core');
const github = require('@actions/github');


var revision = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim()

console.log(revision)

var commitId = revision.slice(0, 7)
console.log(commitId)

const main = async () => {
  try {
    const owner = core.getInput('owner', { required: true });
    const repo = core.getInput('repo', { required: true });
    const pr_number = core.getInput('pr_number', { required: true });
    const token = core.getInput('token', { required: true });
    const commitHash = git.getInput('commitHash', {required: true});
    const octokit = new github.getOctokit(token);

    var shortCommitHash = console.log(commitHash)

    const { data: changedFiles } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pr_number,
      shortCommitHash,
    });

    //var shortCommitHash = console.log(commitHash)

    let diffData = {
      additions: 0,
      deletions: 0,
      changes: 0
    };

    diffData = changedFiles.reduce((acc, file) => {
      acc.additions += file.additions;
      acc.deletions += file.deletions;
      acc.changes += file.changes;
      return acc;
    }, diffData);

   console.log("trimmed commit hash: " + commitId)
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr_number,
      commitHash,
      body: `
        Preview Deployment URL #${shortCommitHash} has been updated with: \n
        - ${diffData.changes} changes \n
        - ${diffData.additions} additions \n
        - ${diffData.deletions} deletions \n
      `
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
