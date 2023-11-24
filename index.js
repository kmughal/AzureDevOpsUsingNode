require('dotenv').config()
const vsoNodeApi = require('azure-devops-node-api');


async function main() {
    const token = process.env.TOKEN
    const project = process.env.PROJECT
    const serverUrl = process.env.SERVER_URL

    const authHandler = vsoNodeApi.getPersonalAccessTokenHandler(token);
    const AzDO = new vsoNodeApi.WebApi(serverUrl, authHandler, undefined);

    const g = await AzDO.getGitApi()
    const repos = await g.getRepositories(project, true, true)
    let count = 1;

    const printCounter = () => {
        console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=')
        console.log('Seq:', (count++))
    }

    let dataFound = false;
    const branchesToExclude = process.env.BRANCHES_TO_EXCLUDE.split(',').map(x => x.toLowerCase())
    console.log('Excluding branches:', branchesToExclude)

    repos.forEach(async (repo) => {
        const branches = await g.getBranches(repo.id, project)
        const myBranches = branches.filter(b => b.commit.author.email == process.env.AUTHOR_EMAIL)

        const names = myBranches
            .map(x => x.name.toLowerCase())
            .filter(branch => !branchesToExclude.some(excludedBranch => branch.includes(excludedBranch)))

        if (names.length) {
            printCounter()
            console.log('name:', repo.name)
            console.log('url:', repo.url)
            console.log('branch:', names)
            dataFound = true;
        }
    })

    if (dataFound === false) console.log('Nothing to print');
}

main()