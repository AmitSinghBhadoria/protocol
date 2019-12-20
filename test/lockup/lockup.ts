contract('LockupTest', () => {
	describe('Lockup; cancel', () => {})
	describe('Lockup; lockup', () => {
		it('address is not property contract', async () => {})
		it('lockup is already canceled', async () => {})
		it('insufficient balance', async () => {})
		it('transfer was failed', async () => {})
		it('success', async () => {})
	})
	describe('Lockup; withdraw', () => {
		it('address is not property contract', async () => {})
		it('lockup is not canceled', async () => {})
		it('waiting for release', async () => {})
		it('dev token is not locked', async () => {})
		it('success', async () => {})
	})
	describe('Lockup: withdrawInterest', () => {
		it(`mints 0 DEV when sender's lockup is 0 DEV`)
		describe('scenario: single lockup', () => {
			// Should use the same Lockup instance each tests because this is a series of scenarios.
			it(`the sender locks up 500 DEV when the property's total lockup is 1000`)
			it(`the property increments interest 1000000`)
			it(
				`withdrawInterestmints mints ${(1000000 * 500) /
					(500 + 1000)} DEV to the sender`
			)
			it(`mints 0 DEV when after the withdrawal`)
		})
		describe('scenario: multiple lockup', () => {
			// Should use the same Lockup instance each tests because this is a series of scenarios.
			it(`the sender locks up 500 DEV when the property's total lockup is 1000`)
			it(`the property increments interest 1000000`)
			it(`the sender locks up 800 DEV`)
			it(`the property increments interest 2000000`)
			it(
				`withdrawInterestmints mints ${(() => {
					const firstPrice = 1000000 / (500 + 1000)
					const secondPrice = 2000000 / (800 + 500 + 1000)
					return firstPrice * 500 + (secondPrice - firstPrice) * 800
				})()} DEV to the sender`
			)
			it(`mints 0 DEV when after the withdrawal`)
		})
	})
})