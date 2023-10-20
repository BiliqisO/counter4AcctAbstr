import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
import { ethers } from "ethers";

import { useState } from "react";
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";

import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";
import {
  ECDSAOwnershipValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
} from "@biconomy/modules";
import Counter from "@/src/Components/Counter";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [account, setAccount] = useState();
  const [active, setActive] = useState(false);

  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );

  // const particle = new ParticleAuthModule.ParticleNetwork({
  //   projectId: "",
  //   clientKey: "",
  //   appId: "",
  //   wallet: {
  //     displayWalletEntry: true,
  //     defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
  //   },
  // });

  const connectToMetamask = async () => {
    if (window.ethereum === undefined)
      return alert("not an ethereum-enabled browser");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setActive(true);
    } catch (error) {
      console.log("error: ", error);
      setActive(false);
    }
  };

  const connect = async () => {
    try {
      setLoading(true);
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);

      const moduler = await ECDSAOwnershipValidationModule.create({
        signer: web3Provider.getSigner(),
        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
      });

      let biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: ChainId.GOERLI,
        bundler: bundler,
        paymaster: paymaster,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: moduler,
        activeValidationModule: moduler,
      });
      setAddress(await biconomySmartAccount.getAccountAddress());
      setSmartAccount(biconomySmartAccount);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const bundler: IBundler = new Bundler({
    bundlerUrl: `https://bundler.biconomy.io/api/v2/${ChainId.GOERLI}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44 `,
    chainId: ChainId.GOERLI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl:
      "https://paymaster.biconomy.io/api/v1/5/I9aButYLt.9f8b5356-b13e-4b7f-8b81-57f4aee3a006",
  });

  return (
    <>
      <Head>
        <title>Based Account Abstraction</title>
        <meta
          name="description"
          content="Account Abstraction"
        />
      </Head>
      <main className={styles.main}>
        <h1>Account Abstraction</h1>
        <h2>Connect and increment</h2>
        {!loading && !address && (
          <button
            onClick={connect}
            className={styles.connect}
          >
            Connect to Based Web3
          </button>
        )}
        {smartAccount && provider && (
          <Counter
            smartAccount={smartAccount}
            address={address}
            provider={provider}
          ></Counter>
        )}

        {loading && <p>Loading Smart Account...</p>}
        {address && <h2>Smart Account: {address}</h2>}
      </main>
    </>
  );
}
