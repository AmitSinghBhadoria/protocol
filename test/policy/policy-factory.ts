import {IPolicyInstance, PolicyInstance} from '../../types/truffle-contracts'
import {DevProtocolInstance, UserInstance} from '../test-lib/instance'
import {getPolicyAddress, validateErrorMessage, mine} from '../test-lib/utils'

contract(
	'PolicyFactory',
	([deployer, user, property, propertyFactory, dummyProperty]) => {
		const dev = new DevProtocolInstance(deployer)
		const userInstance = new UserInstance(dev, user)
		let policy: IPolicyInstance
		describe('PolicyFactory; createPolicy', () => {
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await dev.generatePolicyGroup()
				await dev.generatePolicySet()
				await dev.generatePolicyFactory()
				await dev.generateVoteTimes()
				await dev.generateVoteTimesStorage()
				await dev.generateMarketFactory()
				await dev.generateMarketGroup()
			})
			it('Returns the new Policy address when Policy implementation is passed.', async () => {
				policy = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(policy.address, {
					from: user
				})
				const firstPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line no-undef
				expect(web3.utils.isAddress(firstPolicyAddress)).to.be.equal(true)
			})
			it('If the first Policy, the Policy becomes valid.', async () => {
				policy = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(policy.address, {
					from: user
				})
				const firstPolicyAddress = getPolicyAddress(result)
				const curentPolicyAddress = await dev.addressConfig.policy()
				expect(curentPolicyAddress).to.be.equal(firstPolicyAddress)
			})
			it('The first policy will be treated as voting completed.', async () => {
				policy = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(policy.address, {
					from: user
				})
				const firstPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const firstPolicy = await artifacts
					.require('Policy')
					.at(firstPolicyAddress)
				const voting = await firstPolicy.voting()
				expect(voting).to.be.equal(false)
			})
			it('If other than the first Policy, the Policy is waiting for enable by the voting.', async () => {
				policy = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(policy.address, {
					from: user
				})
				const second = await userInstance.getPolicy('PolicyTest1')
				const secondCreateResult = await dev.policyFactory.create(
					second.address,
					{
						from: user
					}
				)
				const secondPolicyAddress = getPolicyAddress(secondCreateResult)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicy = await artifacts
					.require('Policy')
					.at(secondPolicyAddress)
				const voting = await secondPolicy.voting()
				expect(voting).to.be.equal(true)
			})
			it('The maximum number of votes is incremented.', async () => {
				policy = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(policy.address, {
					from: user
				})
				let times = await dev.voteTimes.getAbstentionTimes(dummyProperty)
				expect(times.toNumber()).to.be.equal(0)
				const second = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(second.address, {
					from: user
				})
				times = await dev.voteTimes.getAbstentionTimes(dummyProperty)
				expect(times.toNumber()).to.be.equal(1)
			})
		})
		describe('A new Policy; vote', () => {
			const policyContract = artifacts.require('Policy')
			let firstPolicyInstance: PolicyInstance
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await dev.generatePolicyGroup()
				await dev.generatePolicySet()
				await dev.generatePolicyFactory()
				await dev.generateVoteTimes()
				await dev.generateVoteTimesStorage()
				await dev.generateVoteCounter()
				await dev.generateMarketFactory()
				await dev.generateMarketGroup()
				await dev.generatePropertyGroup()
				await dev.addressConfig.setPropertyFactory(propertyFactory, {
					from: deployer
				})
				policy = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(policy.address, {
					from: user
				})
				const firstPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				firstPolicyInstance = await policyContract.at(firstPolicyAddress)
				await dev.propertyGroup.addGroup(property, {from: propertyFactory})
			})
			it('Should fail when 1st args is not Property address.', async () => {
				const result = await firstPolicyInstance
					.vote(dummyProperty, true)
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
			it('Should fail voting to the already enable Policy.', async () => {
				const result = await firstPolicyInstance
					.vote(property, true)
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this policy is current')
			})
			it('Should fail to vote when after the voting period.', async () => {
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				const count = await secondPolicyInstance.policyVotingBlocks()
				await mine(count.toNumber())

				const voteResult = await secondPolicyInstance
					.vote(property, true)
					.catch((err: Error) => err)
				validateErrorMessage(voteResult as Error, 'voting deadline is over')
			})
			it('Should fail to vote when the number of lockups and the market reward is 0.', async () => {
				// ロックアップ数と市場報酬が0の場合、投票に失敗するはずです
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				const voteResult = await secondPolicyInstance
					.vote(property, true)
					.catch((err: Error) => err)
				validateErrorMessage(voteResult as Error, 'vote count is 0')
			})
			it('Should fail to vote when already voted.', async () => {
				// すでに投票したときに投票に失敗するはずです
			})
			it('The number of lock-ups for it Property and the accumulated Market reward will be added to the vote when a Property owner votes for.', async () => {
				// プロパティのロックアップの数と累積されたマーケット報酬は、プロパティの所有者が投票したときに投票に追加されます。
			})
			it('The number of votes VoteCounter is added when the Property owner voted.', async () => {
				// 投票数VoteCounterは、所有者が投票したときに追加されます
			})
			it('VoteCounter votes will not be added when a vote by other than Property owner voted for.', async () => {
				// 不動産所有者以外の投票が投票された場合、VoteCounter投票は追加されません。
			})

			it('The number of lock-ups for it Property and the accumulated Market reward will be added to the vote against when a Property owner votes against.', async () => {
				// 不動産所有者が反対票を投じると、その資産のロックアップ数と累積市場報酬が反対票に追加されます
			})
			it('The number of votes VoteCounter is added when the Property owner votes against.', async () => {
				// 所有者が反対票を投じると、投票数VoteCounterが追加されます。
			})
			it('VoteCounter votes will not be added when a vote by other than Property owner voted against.', async () => {
				// 物件所有者以外の投票が反対票を投じた場合、VoteCounter投票は追加されません。
			})

			it('When an account of other than Property owner votes for, the number of lock-ups in the Property by its account will be added to the vote.', async () => {
				// プロパティ所有者以外のアカウントが投票する場合、そのアカウントによるプロパティのロックアップの数が投票に追加されます。
			})
		})
		describe('PolicyFactory; convergePolicy', () => {
			it('Calling `convergePolicy` method when approved by Policy.policyApproval.', async () => {
				// Policy.policyApprovalによって承認されたときに `convergePolicy`メソッドを呼び出す
			})
			it('Change the current Policy by passing a Policy.', async () => {
				// ポリシーを渡すことにより、現在のポリシーを変更します。
			})
			it('Killing another Policy when changing Policy.', async () => {
				// ポリシーを変更するときに別のポリシーを強制終了する
			})
			it('Should fail when a call from other than Policy.', async () => {
				// ポリシー以外からの呼び出し時に失敗する必要があります
			})
		})
	}
)
