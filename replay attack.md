## Replay Attacks in IOTA

by Joseph Rebstock

**Introduction**

This vulnerability report is written after researching and testing the IOTA network through the javascript libraries over a three day period. Specific credit goes to Peter Ryszkiewicz’s open source [network spamming web app](https://github.com/pRizz/iota-transaction-spammer-webapp), that I modified for personal use during my tests. My interest was specifically about how the network would handle inconsistent subtangles if it was presented with dozens of conflicting options. However during this research I found example of behaviour which seemed dangerous to the security of the network. This report presents those findings.

**Decision to Publish**

The decision to publish this report publicly without first fully reaching out to the IOTA foundation was not taken lightly, however I decided to based on the following reasons.

* The IOTA foundations response to the [MIT-DCI report](https://github.com/mit-dci/tangled-curl/blob/master/vuln-iota.md), specifically Come-from-Beyond’s attitude (that he himself will occasionally categorize as trolling). As recently as saying they have ["lawyers working on that already"](https://twitter.com/c___f___b/status/965667086348509185) calling their report fraud. I'm unsure if that is more trolling, but I would rather just post my thing here than dealing with any of that.

* The naive replay attack is limited in scope to a small number of addresses, with only a small number holding an amount of IOTA that would be cared if it were lost. Also, IOTA foundation can unilaterally freeze and put those funds into the reclaim process if they want as I undertand they have done in the past.

* IOTA transaction approval is currently completely centralized by the coordinator, so no information I provide here can be used without explicit consent of the coordinator who could decide to not allow replays (simplest solution).

* The good of the holder of IOTA should be balanced with potential new investors who should know all the facts.

* The attack works based on using the official API call aptly labelled “replayBundle”. Pointing out that this can be used maliciously should not be a surprise to anyone who has spend anytime using the API.

* I have evidence that this replay vulnerability has happened already in the wild, so concealing the vulnerability is futile and only benefits those who may already be using it.

### The Reattach Button AKA “replayBundle”

IOTA utilizes one time signatures which combined with low confirmation rates of transactions necessitates the “replayBundle” feature. Reattaching is often required to get a transaction through and bundles can only be safely signed a single time. Therefore the user is allowed to simply reattach any bundle of transactions they want without any proof of ownership. This should not be a problem because every bundle has a unique hash. The expected behaviour should be that only one use of the same bundle hash should be allowed inside a consistent transaction history (subtangle). 

**The Vulnerability**

However it is not the case that replays of a previously confirmed bundle will not get confirmed again. The coordinator will repeatedly approve the same bundle hash over and over. This means that while you may have signed a transaction to send 500 Miota it can be attached to the network 10 times draining the account of 5000 Miota.

See below for examples of where this has been demonstrated. Note, I have only given examples of with addresses containing less than 10 cents, however I am aware of an example where between $1000-$10000 is at risk of being completely robbed, and already has been stolen from once (likely on accident). 

* [GUVBEXVOHJXNS9JJII9SYJGIHKOOOYLFKUI9KVOELJ9PBQLWGPHWONCGNMTOLCCKUUYHJGNKFBYW9HJXC](https://thetangle.org/bundle/GUVBEXVOHJXNS9JJII9SYJGIHKOOOYLFKUI9KVOELJ9PBQLWGPHWONCGNMTOLCCKUUYHJGNKFBYW9HJXC)

* [AZQLCIRRYSHPBKJLAGQAQ9FCRSUDFIVGJGPRQN9JFYGKDDHDDKABNYBQTUIP9F9XTETGZKYGBKSEISAKD](https://thetangle.org/bundle/AZQLCIRRYSHPBKJLAGQAQ9FCRSUDFIVGJGPRQN9JFYGKDDHDDKABNYBQTUIP9F9XTETGZKYGBKSEISAKD)

* [TTETGYVFACAFIJUASFPLZTJPHVE9WNFBVL9VDPFXHLABHFPAALAPNAJJKACEFBTLQZC9J9NJNHDRGXDFZ](https://thetangle.org/bundle/TTETGYVFACAFIJUASFPLZTJPHVE9WNFBVL9VDPFXHLABHFPAALAPNAJJKACEFBTLQZC9J9NJNHDRGXDFZ)

* [TYKONWZKEXKGDOYANHRKPSA9CCLAAUNPZIWCXQATXBEEGYJXZKD9DSAUGOIXHXVWLNZTHGFEWGQLBIGNB](https://thetangle.org/bundle/TYKONWZKEXKGDOYANHRKPSA9CCLAAUNPZIWCXQATXBEEGYJXZKD9DSAUGOIXHXVWLNZTHGFEWGQLBIGNB)

* [JTXCGYGETVBJX9IWDPLENQAD9JJHHATSNYEDNQWVIKUKYDZVBRKJKZYRAWQIQYBSJZLTKLW9ZSDGPABA9](https://thetangle.org/bundle/JTXCGYGETVBJX9IWDPLENQAD9JJHHATSNYEDNQWVIKUKYDZVBRKJKZYRAWQIQYBSJZLTKLW9ZSDGPABA9)

* [CCIEOODZIDJJRNVKOXCYCTCKNITMLYYU9K9PSDVNLTCPYBYCCJ9DXBFWCECACLBPNUJXKWY99TIFDUEPZ](https://thetangle.org/bundle/CCIEOODZIDJJRNVKOXCYCTCKNITMLYYU9K9PSDVNLTCPYBYCCJ9DXBFWCECACLBPNUJXKWY99TIFDUEPZ)

* [DWALFPLDNQFEPLKQWFINIXYIAOUGEDZCSXGUZJQENGRBZHIVFIUOLLBWSTHLTBKNXYCRSQKURCEGKOLC9](https://thetangle.org/bundle/DWALFPLDNQFEPLKQWFINIXYIAOUGEDZCSXGUZJQENGRBZHIVFIUOLLBWSTHLTBKNXYCRSQKURCEGKOLC9)

* [UFIKRBXHZVI9AWUD9UXAVHXEAGVLHK9FJLPHNSKEAJFWAFONOJUQSYQPJATOAEELFXZAHSPVG9J9NKDJW](https://thetangle.org/bundle/UFIKRBXHZVI9AWUD9UXAVHXEAGVLHK9FJLPHNSKEAJFWAFONOJUQSYQPJATOAEELFXZAHSPVG9J9NKDJW)

**I need to emphasize that these transactions were only signed for once by the coins owner. The replay of them was done with no additional signatures.**

I also worked to confirm that the each “confirmed” set of the bundle really is counted towards the address funds. I showed this by replaying a [bundle with 1 iota](https://thetangle.org/bundle/SKIYVNTSFSINBADH99EWL9JFOEGDZLWHNDSSW9RUGKLERCEBWSFWLDKOJZDAZDFLEPUGVWTIFZRSBGDO9) to an address 5 times. From this address I then sent a [bundle with 5 iota](https://thetangle.org/bundle/WFYLKATAWXWVQXEDAKPSHZCIWXQERA9JTYPACDVCGHZOSAGUACLIXOCCXAVHGWGI9VFSXZUTBNGLQIIVX) to another address. This demonstrates that the balance shown on the tangle explorers is the correct balance as interpreted by the coordinator.

Fortunately, since IOTA discourages the reuse of addresses it is uncommon for there to be any funds left on the address. The replay attack is only applicable where addresses has been reused. However it should not be confused with the signature reuse issue, which is only a theoretical concern for a single reuse. The replay attack applies with only one reuse and is easy to implement.

### Basic Variants of Attack

Because address reuse is discouraged this exploit has limited scope. Unfortunately, there are still plentiful cases where used address still hold funds including the [4th richest address ($221,995,594.67)](https://thetangle.org/address/GCNOSWGBDDAZRLAYIV999YQUDLVJIQG9QTSEZDJVH9UEENIRKAZGEYKVFGUAWNJ9YMZCLUDPSLDLD9EOW). Also there are more sophisticated attacks that would only use the replay exploit as a mechanism in a larger attack. These attacks are described below.

**Naive Attack**

Find a bundle that has already been confirmed once. If it has sufficient funds to be replayed, simply attach it to the network again using the official API command “replayBundle”.  Or more simply the “reattach” button however that includes a bit of logic to prevent accidental replay after a confirmation. There are 3 reasons why an attacker might want to do this.
* They control the account that the replay will send funds to by controlling the seed.
* They control the address that the replay will send funds to by forging signatures. Requires that the address has been reused [2-3 times.](https://public.tangle.works/winternitz.pdf)
* They simply like chaos. A not uncommon trait in humans.

**Chain Replays**

If the naive attack works it will fund the downstream addresses. If those addresses have been emptied previously, the bundle that emptied them can be replayed again. This is important because the attacker may only need access to the 3rd, 4th, 5th etc. address in a chain to syphon funds. 

**Top Up Attack**

If the address has insufficient funds to allow a replay, the attacker can send a top up amount to the address to allow the release of the funds. This extends the number of addresses that are vulnerable to the naive attack.

**Virtual - Top Up Attack**

IOTA leger verification is based on overall consistency of the tangle therefore it is possible to top up the targets account with the same funds that will be removed from their account. For example, I have sent [1000Ti ($2,000,000,000 USD)](https://thetangle.org/transaction/MQOJLVYMDKKJLMPMTSQWAHTTRMMIT9TFOAWAZJDOUA9D9OATPNTXLPWAOVFCPBJQHELHTREQDQXPZ9999) from an address to the same address. It is [confirmed here](https://forum.iota.org/t/iota-double-spending-masterclass/1311) this also works for a bunch of transactions outside a bundle. However I note that with everything it is best to test the actual implentation. These bundles, [1](https://thetangle.org/bundle/WIKGFDCH9TYOLJGJILZADKZVZTOZDKPZFUXFOVZYIAZSOXGOHOGFKLBHLUUPJPNVWLLPIEYFYFUDXCQCW) and [2](https://thetangle.org/bundle/QWGGHYVIBBJSZUIGCVFUAEEXQRRUHGLFDCSBKDOCPNZPSWJAVXZALDH9TKLKLRDYDDGD9ROQVYHOGHIVA), demonstate that virtual chains extending between bundles are possible. This reduces the upfront cost of the Top up Attack to zero, since the top up value can be completely virtual.

### Social Engineering Variations
Using some creativity the attacker can manipulate situations to help allow the attacks described above. Here are some examples.

**“Baiting” Signature Reuse**
In this case the attacker finds an address they would like to control as the exit address in a Chain Replay. They send $1 transfers to this address tempting the owner to withdraw them. The owner might see this as free money and withdraw it to a safe address. Some wallets may even do this automatically. This would leave the attacker with enough information to forge transactions from the address.

**“Missed a Zero”**

The attacker first sends 1/10 the amount they promise to their target. At the same time they send the full amount however for this they place it on the tangle in such a way it won’t possibly confirm (ex. approve inconsistent tips). They then request the person to send back the 1/10th making the claim they missed a zero. Once that is received back they send the full amount. Everything looks good, except the attacker now has a built in channel to take back the full amount by simply replaying the 1/10th transaction 10 times. They can do this immediately after receiving the money, goods, or service they purchased.

**Sharing Know “Useless” Seeds.**

Once a seed is exposed it is presumably useless, however if it controls a used set of addresses it suddenly has value again to an attacker for a chain replay. The attacker would try to exploit the feeling that there is no danger in giving away a seed once all funds are removed from that account. Trading old seeds for “air drops” or “faucets” as a proof of identity is one way this could be presented by the attacker.

### Recommendation

All that needs to be done to fix this is keep track of the unique hash of each signed transaction bundle. With this information make a rule that the same bundle hash cannot be used twice within a subtangle. 

### Conclusion

As it stands at the time of writing IOTA has a security vulnerability consisting of replaying old transactions. It can be easily fixed as suggested in my recommendation. However, the fact that it is such a simple fix to such an obvious problem should give everyone involved with IOTA pause and hopefully a bit more humility. 



> **About Me** I'm not a real trained programmer as you can probably tell from by github here. I would descibe myself as a sripter only.
