import { useState } from "react";
import { ContractInterface, ethers } from "ethers";
import abi from "../utils/abi.json";
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
} from "@biconomy/paymaster";
import { BiconomySmartAccountV2 } from "@biconomy/account";
import styles from "@/styles/Home.module.css";

const counterAddress = "0x7a86CDE7B8C41143e8862AC9f6A81185Dd5f8965";

interface Props {
  smartAccount: BiconomySmartAccountV2;
  address: string;
  provider: ethers.providers.Provider;
}

const Counter: React.FC<Props> = ({ smartAccount, address, provider }) => {
  const [number, setNumber] = useState(0);
  const [mesage, setMesage] = useState("");

  const handleIncrement = async () => {
    const contract = new ethers.Contract(
      counterAddress,
      abi as unknown as ContractInterface,
      provider
    );
    try {
      const incrementTx = await contract.populateTransaction.increment();

      console.log(incrementTx.data);
      const tx1 = {
        to: counterAddress,
        data: incrementTx.data,
      };
      let userOp = await smartAccount.buildUserOp([tx1]);
      //   console.log({ userOp });

      const biconomyPaymaster =
        smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
      let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
        smartAccountInfo: {
          name: "BICONOMY",
          version: "2.0.0",
        },
      };
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
    } catch (err: any) {
      console.error(err);
      console.log(err);
    }
  };
  const getMsgSEnder = async () => {
    const contract = new ethers.Contract(
      counterAddress,
      abi as unknown as ContractInterface,
      provider
    );
    const getMsgSenderTx = await contract.returnAddr();
    setMesage(getMsgSenderTx);

    console.log("msgsender", getMsgSenderTx);
  };

  const getNumber = async () => {
    const contract = new ethers.Contract(
      counterAddress,
      abi as unknown as ContractInterface,
      provider
    );
    const getNumberTx = await contract.number();
    setNumber(getNumberTx);

    console.log("number", Number(getNumberTx));
  };
  return (
    <>
      {address && (
        <button
          onClick={handleIncrement}
          className={styles.connect}
        >
          increment Number
        </button>
      )}

      {address && (
        <button
          onClick={getMsgSEnder}
          className={styles.connect}
        >
          Get Address {mesage}
        </button>
      )}
      {address && (
        <button
          onClick={getNumber}
          className={styles.connect}
        >
          Get Number {Number(number)}
        </button>
      )}
    </>
  );
};
export default Counter;
