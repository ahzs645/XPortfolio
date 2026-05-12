// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import React, { useEffect, useState } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appDataClient } from '../../../storage';
import { localDb } from '../../../storage/localDexie/db';
import { useFileSystemOperations } from '../useFileSystemOperations';

const ROOT_ID = 'root';

function createInitialFileSystem() {
  return {
    [ROOT_ID]: {
      id: ROOT_ID,
      type: 'folder',
      name: 'Root',
      children: [],
      dateCreated: 1,
      dateModified: 1,
    },
  };
}

function OperationsHarness({ capture }) {
  const [fileSystem, setFileSystem] = useState(createInitialFileSystem);
  const operations = useFileSystemOperations(fileSystem, setFileSystem, appDataClient);

  useEffect(() => {
    capture.current = {
      fileSystem,
      operations,
    };
  }, [capture, fileSystem, operations]);

  return null;
}

describe('useFileSystemOperations', () => {
  beforeEach(async () => {
    await localDb.open();
    await appDataClient.maintenance.clearAll();
  });

  afterEach(async () => {
    await appDataClient.maintenance.clearAll();
    localDb.close();
  });

  it('creates, opens, copies, and deletes file content with storage cleanup', async () => {
    const capture = { current: null };
    render(<OperationsHarness capture={capture} />);

    await waitFor(() => {
      expect(capture.current?.operations).toBeTruthy();
    });

    let fileId;
    await act(async () => {
      fileId = await capture.current.operations.createFile(
        ROOT_ID,
        'note.txt',
        {
          data: 'hello world',
          size: 11,
          type: 'text/plain',
        }
      );
    });

    await waitFor(() => {
      expect(capture.current.fileSystem[fileId]).toBeTruthy();
    });

    const createdFile = capture.current.fileSystem[fileId];
    expect(createdFile.storageType).toBe('local');
    expect(createdFile.storageKey).toBeTruthy();
    expect(createdFile.data).toBeUndefined();
    await expect(capture.current.operations.getFileContent(fileId)).resolves.toBe('hello world');

    let copyId;
    await act(async () => {
      copyId = await capture.current.operations.cloneItem(fileId, ROOT_ID);
    });

    await waitFor(() => {
      expect(capture.current.fileSystem[copyId]).toBeTruthy();
    });

    const copiedFile = capture.current.fileSystem[copyId];
    expect(copiedFile.storageKey).toBeTruthy();
    expect(copiedFile.storageKey).not.toBe(createdFile.storageKey);
    await expect(capture.current.operations.getFileContent(copyId)).resolves.toBe('hello world');

    await act(async () => {
      await capture.current.operations.deleteItem(fileId);
    });

    await waitFor(() => {
      expect(capture.current.fileSystem[fileId]).toBeUndefined();
    });

    await expect(appDataClient.fileContents.get(createdFile.storageKey)).resolves.toBeNull();
    await expect(appDataClient.fileContents.get(copiedFile.storageKey)).resolves.toBe('hello world');
  });
});

