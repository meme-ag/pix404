import { component$, useStore, useTask$ } from '@builder.io/qwik';
import { Connection, PublicKey } from '@solana/web3.js';

export const NFTGallery = component$(() => {
  const store = useStore({
    nfts: [],
    loading: true,
    error: null
  });

  useTask$(async () => {
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const walletAddress = new PublicKey('YOUR_WALLET_ADDRESS'); // Replace with actual wallet address

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
      store.loading = false;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      store.error = 'Failed to fetch NFTs. Please try again later.';
      store.loading = false;
    }
  });

  return (
    <div>
      <h2>Your NFTs</h2>
      {store.loading ? (
        <p>Loading your NFTs...</p>
      ) : store.error ? (
        <p>{store.error}</p>
      ) : (
        <ul>
          {store.nfts.map((nft) => (
            <li key={nft.mint}>
              <p>Mint: {nft.mint}</p>
              <p>Token Account: {nft.tokenAccount}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});