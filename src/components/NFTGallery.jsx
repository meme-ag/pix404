import { component$, useStore, useTask$ } from '@builder.io/qwik';
import { Connection, PublicKey } from '@solana/web3.js';
import { Image } from '@unpic/qwik';

export const NFTGallery = component$(() => {
  const store = useStore({
    nfts: [],
    loading: true,
    error: null,
    walletConnected: false
  });

  useTask$(async () => {
    try {
      // Check if window.solana is available
      if (typeof window !== 'undefined' && window.solana) {
        // Attempt to connect to the wallet
        await window.solana.connect();
        store.walletConnected = true;

        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const walletAddress = new PublicKey(window.solana.publicKey.toString());

        const nftAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        });

        const nfts = nftAccounts.value
          .filter(account => account.account.data.parsed.info.tokenAmount.uiAmount === 1)
          .map(account => ({
            mint: account.account.data.parsed.info.mint,
            tokenAccount: account.pubkey.toBase58()
          }));

        store.nfts = nfts;
      } else {
        store.error = 'Solana wallet not detected. Please install a Solana wallet extension.';
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      store.error = 'Failed to connect to wallet or fetch NFTs. Please try again later.';
    } finally {
      store.loading = false;
    }
  });

  return (
    <div class="nft-gallery">
      <h2 class="pixelated-text">Your NFTs</h2>
      {store.loading ? (
        <p class="pixelated-text">Loading your NFTs...</p>
      ) : store.error ? (
        <p class="pixelated-text error">{store.error}</p>
      ) : !store.walletConnected ? (
        <p class="pixelated-text">Please connect your Solana wallet to view your NFTs.</p>
      ) : store.nfts.length === 0 ? (
        <p class="pixelated-text">No NFTs found in this wallet.</p>
      ) : (
        <ul class="nft-list">
          {store.nfts.map((nft) => (
            <li key={nft.mint} class="nft-item pixelated-text">
              <Image
                src={`https://arweave.net/${nft.mint}`}
                alt={`NFT ${nft.mint}`}
                width={200}
                height={200}
                layout="constrained"
              />
              <p>Mint: {nft.mint}</p>
              <p>Token Account: {nft.tokenAccount}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});