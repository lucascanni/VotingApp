App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        await ethereum.enable()
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        console.error("User denied account access")
      }
    } else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      web3.eth.sendTransaction({/* ... */})
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    App.account = (await web3.eth.getAccounts())[0]
  },

  loadContract: async () => {
    const voting = await $.getJSON('Voting.json')
    App.contracts.Voting = TruffleContract(voting)
    App.contracts.Voting.setProvider(App.web3Provider)

    App.voting = await App.contracts.Voting.deployed()
  },

  render: async () => {
    if (App.loading) {
      return
    }
    App.setLoading(true)

    $('#account').html(App.account)

    await App.renderProposals()

    App.setLoading(false)
  },

  renderProposals: async () => {
    const proposalCount = await App.voting.proposalCount()
    const $proposalsTable = $('#proposals tbody')
    $proposalsTable.empty()

    for (let i = 1; i <= proposalCount; i++) {
      const proposal = await App.voting.proposals(i)
      const proposalId = proposal[0].toNumber()
      const proposalName = proposal[1]
      const proposalVoteCount = proposal[2].toNumber()

      const $proposalRow = $('<tr>')
      $proposalRow.append($('<td>').text(proposalName))
      $proposalRow.append($('<td>').text(proposalVoteCount))

      const $voteButton = $('<button>')
        .addClass('btn btn-primary voteButton')
        .text('Vote')
        .attr('data-id', proposalId)
        .on('click', () => App.castVote(proposalId))

      $proposalRow.append($('<td>').append($voteButton))

      $proposalsTable.append($proposalRow)
    }
  },

  createProposal: async () => {
    App.setLoading(true)
    const $submitButton = $('#newProposal button[type="submit"]')
    $submitButton.prop('disabled', true)
    const proposalName = $('#proposalName').val()
    await App.voting.createProposal(proposalName, { from: App.account })
    window.location.reload()
  },

  castVote: async (proposalId) => { 
    App.setLoading(true)
    await App.voting.vote(proposalId, { from: App.account })
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})
