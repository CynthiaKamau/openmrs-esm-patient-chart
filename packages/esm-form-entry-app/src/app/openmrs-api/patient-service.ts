import { Injectable } from '@angular/core';
import { ReplaySubject, BehaviorSubject, Observable, forkJoin, combineLatest } from 'rxjs';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { PatientResourceService } from './patient-resource.service';
import { showToast } from '@openmrs/esm-framework';
import { PatientIdentiferPayload } from '../types';

@Injectable()
export class PatientService {
  public currentlyLoadedPatient: BehaviorSubject<any> = new BehaviorSubject(null);
  public currentlyLoadedPatientUuid = new BehaviorSubject<string>(null);
  public isBusy: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private patientResourceService: PatientResourceService,
    private encounterResource: EncounterResourceService,
  ) {}

  private createPatientIdentifierPayload(
    identifier: string,
    identifierType: string,
    locationUuid: string,
    preferred: boolean,
  ): PatientIdentiferPayload {
    return {
      identifier: identifier,
      identifierType: identifierType,
      location: locationUuid,
      preferred: true,
    };
  }

  private updatePatientIdentifierPayload(identifier: string): PatientIdentiferPayload {
    return { identifier: identifier };
  }

  public setCurrentlyLoadedPatientByUuid(patientUuid: string): BehaviorSubject<any> {
    if (this.currentlyLoadedPatient.value !== null) {
      // this means there is already a currently loaded patient
      const previousPatient = this.currentlyLoadedPatient.value;
      // fetch from server if patient is NOT the same
      if (previousPatient.uuid !== patientUuid) {
        this.fetchPatientByUuid(patientUuid);
      }
    } else {
      // At this point we have not set patient object so let's hit the server
      this.fetchPatientByUuid(patientUuid);
    }
    return this.currentlyLoadedPatient;
  }

  public fetchPatientByUuid(patientUuid: string) {
    // reset patient
    this.currentlyLoadedPatient.next(null);
    this.currentlyLoadedPatientUuid.next(null);
    // busy
    this.isBusy.next(true);
    // hit server
    return forkJoin(
      this.patientResourceService.getPatientByUuid(patientUuid, false),
      this.encounterResource.getEncountersByPatientUuid(patientUuid),
    ).subscribe(
      (data) => {
        const patient = data[0];
        patient.encounters = data[1];
        this.currentlyLoadedPatient.next(patient);
        this.currentlyLoadedPatientUuid.next(patientUuid);
        this.isBusy.next(false);
      },
      (err) => {
        console.error(err);
        this.isBusy.next(false);
      },
    );
  }

  public reloadCurrentPatient() {
    if (this.currentlyLoadedPatient.value !== null) {
      const previousPatient = this.currentlyLoadedPatient.value;
      this.fetchPatientByUuid(previousPatient.uuid);
    }
  }
  public resetPatientService() {
    this.currentlyLoadedPatient = new BehaviorSubject(null);
    this.currentlyLoadedPatientUuid = new BehaviorSubject<string>(null);
    this.isBusy = new BehaviorSubject(false);
  }

  private showToastMessage(title: string, description: string, kind: 'success' | 'error'): void {
    showToast({ title, description, kind });
  }

  public createPatientIdentifier(
    patientUuid: string,
    locationUuid: string,
    identifier: string,
    identifierUuid: string,
    identifierType: string,
  ) {
    const payload = this.createPatientIdentifierPayload(identifier, identifierType, locationUuid, true);
    this.patientResourceService.saveUpdatePatientIdentifier(patientUuid, identifierUuid, payload).subscribe(() => {
      this.showToastMessage('Patient identifier saved', 'Patient identifier has been added', 'success');
    });
    return;
  }

  public updatePatientIdentifier(patientUuid: string, identifier: string, identifierUuid: string) {
    const payload = this.updatePatientIdentifierPayload(identifier);
    this.patientResourceService.saveUpdatePatientIdentifier(patientUuid, identifierUuid, payload).subscribe(() => {
      this.showToastMessage('Patient identifier updated', 'Patient identifier has been updated', 'success');
    });
    return;
  }
}
